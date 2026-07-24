# Payments (Stripe) — Aureon

This document covers the payments slice: Stripe checkout, the order webhook,
refunds, and seller payouts via Stripe Connect. It explains the environment
variables, local setup, how money flows through the system, and the notable
design decisions.

> **Scope note.** The customer-facing browse/product pages are a separate slice
> and currently serve mock products. Because of that, a checkout **cannot be
> completed through the browser yet** — the cart holds mock product ids that
> don't exist in the real database, and checkout correctly rejects them. The
> payment backend itself is complete and verified (see _Testing_ below).

---

## 1. Environment variables

Set these in `.env.local` (copy from `.env.example`). All are test-mode values.

| Variable | What it is | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client key for Stripe.js / Payment Element | Stripe Dashboard → Developers → API keys (`pk_test_…`) |
| `STRIPE_SECRET_KEY` | Server key for the Stripe SDK | Stripe Dashboard → Developers → API keys (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Verifies incoming webhook signatures | Printed by `stripe listen` (see below) (`whsec_…`) |
| `STRIPE_PLATFORM_FEE_PERCENT` | Platform commission per sale (default `10`) | You choose |

The payment layer also relies on Supabase (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) to persist orders —
see [`docs/supabase-setup.md`](./supabase-setup.md).

### Dev mode vs live mode

`DEVELOPMENT_MODE` (and its client mirror `NEXT_PUBLIC_DEVELOPMENT_MODE`) switch
the whole app between mock and live behaviour. The derived flag `useLiveData`
(`src/lib/config.ts`) is `true` only when Supabase is configured **and**
development mode is off.

- **Dev mode (`true`):** checkout uses a fake card flow, no real Stripe or DB
  writes. Lets teammates run the app with no credentials.
- **Live mode (`false`):** real Payment Element, real webhook, real orders.
  Keep both `DEVELOPMENT_MODE` and `NEXT_PUBLIC_DEVELOPMENT_MODE` in sync.

---

## 2. Local setup

1. Add your Stripe test keys to `.env.local` (table above).
2. Install the Stripe CLI: <https://docs.stripe.com/stripe-cli>
   (`winget install Stripe.StripeCli` on Windows).
3. Forward webhook events to the local app:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`, then restart
   `npm run dev` so the new secret is picked up.
4. Set `DEVELOPMENT_MODE=false` and `NEXT_PUBLIC_DEVELOPMENT_MODE=false` to
   exercise the real flow.

---

## 3. How it works

### Checkout — `POST /api/checkout`
`src/app/api/checkout/route.ts`

- Accepts `{ items: [{ productId, qty }] }`. The client never sends prices.
- **Recomputes every price server-side** from Supabase (or the mock catalog in
  dev mode) — this is the security boundary against tampered totals.
- Adds the platform fee and creates a Stripe **PaymentIntent** for the total.
- Line items (with each item's `sellerId`) and the buyer id are stored in the
  PaymentIntent `metadata` so the webhook can build the order later.
- Returns `client_secret`; the checkout page renders the Stripe **Payment
  Element** and calls `stripe.confirmPayment()`
  (`src/app/(shop)/checkout/page.tsx`).

### Webhook — `POST /api/webhooks/stripe`
`src/app/api/webhooks/stripe/route.ts`

The source of truth for orders. Verifies the Stripe signature, then:

- `payment_intent.succeeded` → creates the `orders` row and `order_items`
  (idempotently — Stripe retries are ignored), then fans out **per-seller
  transfers** (see _Marketplace payouts_).
- `charge.refunded` → flips the matching order to `refunded`.
- `payment_intent.payment_failed` → logged.

### Order confirmation
`src/app/(shop)/checkout/success/page.tsx` polls
`GET /api/orders/by-payment-intent/[id]` for the order the webhook just wrote
(the webhook can lag a second behind the browser redirect), then shows the real
order. `/account/orders` lists the signed-in buyer's real orders.

### Refunds — `POST /api/orders/[id]/refund`
`src/app/api/orders/[id]/refund/route.ts`

- **Admins** can refund any order; **sellers** can refund only orders that
  contain one of their own line items.
- Issues a Stripe refund against the order's PaymentIntent and marks the order
  `refunded` (the `charge.refunded` webhook is the confirming source of truth).
- UI: the `RefundButton` on `/admin/orders` and `/seller/orders`.

### Seller payouts — Stripe Connect
`src/lib/stripe/connect.ts`, `src/app/api/seller/connect/route.ts`,
`src/app/seller/payouts/page.tsx`

- A seller clicks **Set up payouts** → the app creates a Connect account (if
  needed), stores `stripe_account_id` on their `seller_profiles` row, and
  redirects to Stripe's hosted onboarding.
- The payouts page reads live account status and keeps
  `stripe_onboarding_complete` in sync — the webhook's transfer step checks this
  flag before paying a seller out.

### Marketplace payouts (per-seller transfers)
A cart can contain items from multiple sellers, but a PaymentIntent can only
target one account. So the **full charge goes to the platform**, and after
payment succeeds the webhook creates a **`Transfer` per seller** (their subtotal
minus the platform fee). Sellers who haven't finished Connect onboarding are
skipped with a warning until they do.

---

## 4. Design notes / gotchas

- **Money is stored in cents.** `products.price`, `orders.total_amount`,
  `order_items.price` are `BIGINT` cents in Supabase, while the rest of the app
  (cart, `formatPrice`) works in whole dollars. The checkout route divides by
  100 on read; the webhook multiplies by 100 on write.
- **Standard Connect accounts, not Express.** This project's Stripe account is
  registered in **Malaysia**, where Stripe blocks platforms from creating
  Express/Custom (loss-liable) accounts. `createConnectAccount` uses
  `type: "standard"`, which still supports Account Links onboarding and
  marketplace transfers. Sellers get their own Stripe dashboard; cross-border
  transfers may have restrictions.
- **The webhook is the source of truth**, not the browser. Orders are created by
  the webhook on `payment_intent.succeeded`, never client-side.
- **Mock fallback everywhere.** When Stripe keys are absent, checkout falls back
  to a fake flow so the app runs without credentials.

---

## 5. Testing

Backend, verified with the Stripe CLI + a real test charge:

- `stripe listen …` running, then create/confirm a PaymentIntent with test card
  `pm_card_visa` → webhook creates the correct `orders` / `order_items` rows
  (amounts in cents), transfers skipped for un-onboarded sellers.
- Refund the PaymentIntent → `charge.refunded` webhook flips the order to
  `refunded`.
- Connect: create a Standard account → generate an onboarding link → retrieve
  status.

In the browser (live mode, signed in with the right role):

| Page | Expectation |
| --- | --- |
| `/admin` | Real platform KPIs + GMV chart |
| `/admin/orders` | Real orders; **Refund** flips an order to `refunded` |
| `/seller` | The seller's real revenue / sales / listings |
| `/seller/orders` | The seller's real orders + refund |
| `/seller/payouts` | **Set up payouts** redirects to Stripe onboarding |

Stripe test cards: <https://docs.stripe.com/testing> (e.g. `4242 4242 4242 4242`).
