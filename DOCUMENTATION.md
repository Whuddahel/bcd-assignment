# Aureon — System Documentation

> Aureon is a curated marketplace for authenticated luxury watches, art, and rare
> collectibles. This document is the complete system setup guide and a feature‑by‑feature
> explanation of the platform. **Phase 1** (this document) covers the full commerce stack.
> **Phase 2** — on‑chain provenance / authenticity certificates — is scaffolded in the schema
> and UI but intentionally out of scope here.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Tech stack](#2-tech-stack)
3. [Local setup guide](#3-local-setup-guide)
4. [Environment variables](#4-environment-variables)
5. [External services — turnkey setup checklists](#5-external-services--turnkey-setup-checklists)
   - [Supabase (database + auth)](#51-supabase-database--auth)
   - [Google & Apple OAuth](#52-google--apple-oauth)
   - [Stripe (payments, Connect, webhooks)](#53-stripe-payments-connect-webhooks)
   - [Resend (transactional email)](#54-resend-transactional-email)
   - [Vercel (deployment)](#55-vercel-deployment)
6. [Data layer & view‑models](#6-data-layer--view-models)
7. [Feature reference](#7-feature-reference)
8. [Security model (RLS + roles)](#8-security-model-rls--roles)
9. [Test accounts](#9-test-accounts)
10. [Blockchain (Phase 2)](#10-blockchain-phase-2)

---

## 1. Architecture overview

Aureon is a single Next.js 16 application (App Router) backed by Supabase. There is no
separate backend service — server logic lives in **React Server Components**, **route
handlers** (`src/app/api/*`), and **server actions** (`src/lib/actions/*`).

```
Browser ──► Next.js (App Router, RSC + route handlers + server actions)
                │
                ├─ Supabase Postgres  (data, Row‑Level Security)
                ├─ Supabase Auth      (email/password + Google/Apple OAuth)
                ├─ Supabase Storage   (avatars, product images)
                ├─ Stripe             (Payment Element, Connect payouts, webhooks)
                └─ Resend             (transactional email via React Email templates)
```

Key principles:

- **Live data only.** Every page reads from Supabase through a typed server‑only data
  layer (`src/lib/data/*`). There is no mock catalog — the app talks to the real database.
- **Prices are money‑safe.** All monetary amounts are stored in the database as integer
  **cents** and converted to whole‑dollar display values in the view‑model layer. Checkout
  never trusts client‑supplied prices — the server recomputes every total from the database.
- **Role‑based access** is enforced in three layers: middleware (route gating), server
  guards (`requireUser`), and Postgres Row‑Level Security (the real security boundary).

---

## 2. Tech stack

| Area            | Technology |
| --------------- | ---------- |
| Framework       | Next.js 16 (App Router, Turbopack, React 19) |
| Language        | TypeScript (strict) |
| Styling         | Tailwind CSS v4, Radix UI primitives, Framer Motion |
| Database / Auth | Supabase (Postgres, Auth, Storage, Row‑Level Security) |
| Payments        | Stripe — Payment Element, Connect (Standard accounts), webhooks |
| Email           | Resend + React Email (`@react-email/components`) |
| Client state    | Zustand (cart, notifications), TanStack Query (session) |
| Validation      | Zod (env, forms, server actions) |
| Charts          | Recharts |

---

## 3. Local setup guide

**Prerequisites:** Node 20+, npm, and a Supabase project (hosted or local via the Supabase CLI).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#    …then fill in the values (see §4). At minimum you need the three
#    NEXT_PUBLIC_SUPABASE_* / SUPABASE_SERVICE_ROLE_KEY values to boot.

# 3. Apply the database schema + seed (if using a fresh project)
#    Hosted: run the SQL in the Supabase dashboard SQL editor, in order:
#      supabase/migrations/20240101000000_initial_schema.sql
#      supabase/migrations/20240101000001_fix_orders_policy_recursion.sql
#      supabase/seed.sql
#    Local CLI: `supabase db reset` applies migrations + seed automatically.

# 4. Run the dev server
npm run dev            # http://localhost:3000 (or 3001 if 3000 is taken)
```

### Scripts

| Command          | Purpose |
| ---------------- | ------- |
| `npm run dev`    | Start the dev server (Turbopack) |
| `npm run build`  | Production build (runs a full type check) |
| `npm run start`  | Serve the production build |
| `npm run lint`   | ESLint |
| `npm run format` | Prettier |

---

## 4. Environment variables

See `.env.example` for the full annotated list. Summary:

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public origin; used for OAuth/email redirect links |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server‑only; bypasses RLS (webhooks, admin reads) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for payments | Stripe publishable key |
| `STRIPE_SECRET_KEY` | for payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | for payments | Signing secret for the webhook endpoint |
| `STRIPE_PLATFORM_FEE_PERCENT` | optional | Marketplace fee %, default `10` |
| `RESEND_API_KEY` | for email | Resend API key |
| `RESEND_FROM_EMAIL` | for email | Verified sender address |
| `DEVELOPMENT_MODE` / `NEXT_PUBLIC_DEVELOPMENT_MODE` | optional | `false` in production; only hides dev banners |

Each integration degrades gracefully: with no Stripe keys the checkout API returns
`503`; with no Resend key emails are logged and skipped. The app never crashes on a
missing optional key.

---

## 5. External services — turnkey setup checklists

The code is wired to environment variables so that going live is "paste a key and it
works." These are the dashboard steps that must be done in each provider's console.

### 5.1 Supabase (database + auth)

1. Create a project at <https://supabase.com/dashboard>.
2. **Database:** open the SQL editor and run, in order, the two files in
   `supabase/migrations/` then `supabase/seed.sql`. (Or `supabase db reset` locally.)
3. **Storage:** create a public bucket named `avatars` (used by profile picture upload).
   Create a `product-images` bucket if you want hosted product uploads.
4. **API keys:** Settings → API → copy the Project URL, `anon` key, and `service_role`
   key into `.env.local` / your host's env.
5. **Auth → URL configuration:** set the Site URL and add your deployed URL +
   `…/auth/callback` to the redirect allow‑list.

### 5.2 Google & Apple OAuth

Configured entirely in the Supabase dashboard (the app just calls
`supabase.auth.signInWithOAuth`).

**Google**
1. Google Cloud Console → APIs & Services → Credentials → create an **OAuth 2.0 Client ID**
   (Web application).
2. Authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Copy the Client ID + Secret into Supabase → Authentication → Providers → **Google**, enable it.

**Apple**
1. Apple Developer → Certificates, Identifiers & Profiles → create a Services ID and a
   Sign in with Apple key.
2. Return URL: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Enter the Services ID / Team ID / Key ID / private key in Supabase → Providers → **Apple**, enable it.

The in‑app buttons (`src/components/auth/oauth-buttons.tsx`) and the code‑exchange route
(`src/app/auth/callback/route.ts`) are already implemented — no code changes needed.

### 5.3 Stripe (payments, Connect, webhooks)

1. Create/obtain your Stripe account keys (test first, then live). Put the publishable +
   secret keys in env.
2. **Connect:** enable Connect in the Stripe dashboard. Aureon uses **Standard** connected
   accounts (some platform regions cannot create Express/Custom accounts). Sellers onboard
   via `/seller/payouts`, which calls `/api/seller/connect` to create the account + a hosted
   onboarding link.
3. **Webhook endpoint:** Developers → Webhooks → add endpoint
   `https://<your-domain>/api/webhooks/stripe`, subscribe to at least
   `payment_intent.succeeded` and `charge.refunded`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
   - Locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
4. **Platform fee:** set `STRIPE_PLATFORM_FEE_PERCENT` (default `10`).

Flow: checkout → `/api/checkout` creates a PaymentIntent (server recomputes totals) →
Payment Element collects the card → on `payment_intent.succeeded` the webhook writes the
order, line items, and per‑seller Connect transfers, then sends the confirmation email.

### 5.4 Resend (transactional email)

1. Create an API key at <https://resend.com>.
2. Verify your sending domain and set `RESEND_FROM_EMAIL` to an address on it
   (e.g. `noreply@yourdomain.com`).
3. Put the key in `RESEND_API_KEY`.

Templates live in `src/emails/*` (React Email) and are sent through
`src/lib/email/client.ts`. Wired events: **order confirmation** (Stripe webhook),
**shipping update** (`/api/orders/[id]/status`), **seller approval**
(`/api/admin/sellers/[id]/verify`), plus welcome / verification / support‑reply templates.

### 5.5 Vercel (deployment)

1. Import the repo at <https://vercel.com/new> (framework auto‑detected as Next.js).
2. Add **all** environment variables from §4 in Project → Settings → Environment Variables.
   Set `NEXT_PUBLIC_APP_URL` to the production URL and `DEVELOPMENT_MODE=false`.
3. Deploy. Then update Supabase Auth redirect URLs and the Stripe webhook endpoint to the
   production domain (§5.1, §5.3).

The README's **Deployment** section has the click‑by‑click version of this.

---

## 6. Data layer & view‑models

All reads go through `src/lib/data/*` (server‑only modules). Each returns a **view‑model**
(`src/lib/data/types.ts`) — a UI‑shaped object decoupled from the raw database row:

- Converts prices from **cents → whole dollars**.
- Derives presentational fields the schema doesn't store (a stable per‑product gradient, a
  rarity tier from price, a badge from `is_trending` / `is_featured`).
- Flattens joined relations (seller name, category, images) into flat fields.

| Module | Responsibility |
| ------ | -------------- |
| `products.ts` | Catalog queries, filters, search, seller listings |
| `categories.ts` | Categories + live product counts |
| `sellers.ts` | Seller profiles + derived specialty |
| `orders.ts` | Buyer & seller orders with line items |
| `reviews.ts` | Product reviews + rating summaries |
| `wishlist.ts` | Wishlist products + id sets |
| `tickets.ts` | Support tickets + threaded messages |
| `dashboard.ts` | Seller / admin / support aggregate stats |
| `admin.ts` | All‑products / all‑users admin reads |
| `notifications.ts` | In‑app notification inbox |

Writes go through **server actions** in `src/lib/actions/*` (wishlist, product CRUD, seller
application, reviews, support tickets) — each validates input with Zod and relies on RLS
for authorization.

---

## 7. Feature reference

### Customer

- **Browse** (`/browse`) — full catalog with client‑side search, category / condition /
  price‑range filters, and sorting, hydrated from live products.
- **Product detail** (`/product/[slug]`) — gallery, attributes, provenance note, seller
  card, reviews with average rating, related items, add‑to‑cart, and wishlist toggle.
- **Cart & checkout** — Zustand cart (persisted) → `/checkout` three‑step flow (shipping →
  Stripe Payment Element → review) → `/checkout/success`. Totals are recomputed server‑side.
- **Orders** (`/account/orders`) — real order history with line items and status.
- **Wishlist** (`/account/wishlist`) — saved items with sort, price‑drop detection, and
  one‑click add‑all‑to‑cart; remove is a real mutation.
- **My Collection** (`/account/collection`) — owned items from fulfilled orders, with an
  estimated‑value view and the Phase‑2 blockchain‑provenance placeholder.
- **Profile settings** (`/account/profile`) — edit profile + avatar upload to Supabase Storage.
- **Reviews** — customers can leave/update a review per product (server action, upsert).

### Seller

- **Dashboard** (`/seller`) — revenue, sales, active listings, rating, monthly revenue
  chart, recent orders, and top listings.
- **Listings** (`/seller/products`, `/seller/products/new`) — create listings (draft or
  submit‑for‑review) and delete, all persisted to Supabase.
- **Orders** (`/seller/orders`) — per‑seller line items with refund controls.
- **Analytics** (`/seller/analytics`) — revenue, category mix, and top performers.
- **Payouts** (`/seller/payouts`) — Stripe Connect onboarding + live account status.
- **Apply** (`/seller/apply`) — become a seller; creates a seller profile (pending
  verification) and promotes the account role.

### Admin

- **Overview** (`/admin`) — platform users, sellers, GMV, orders, pending verifications,
  monthly GMV chart, top sellers.
- **Products / Users** (`/admin/products`, `/admin/users`) — moderation views over all data.
- **Orders** (`/admin/orders`) — platform‑wide orders with refund capability.
- **Seller verification** — `/api/admin/sellers/[id]/verify` flips a seller to verified and
  emails them the approval.

### Support

- **Inbox** (`/support`) — all tickets with open / in‑progress / resolved counts.
- **Ticket detail** (`/support/tickets/[id]`) — threaded conversation, public replies vs
  internal notes, **canned responses**, and status management — all real mutations.

### Payments & email (cross‑cutting)

- Stripe Payment Element checkout, PaymentIntent creation, and a signature‑verified webhook
  that creates orders + per‑seller Connect transfers.
- Refund flow from both seller and admin surfaces (`/api/orders/[id]/refund`).
- Order status transitions (`/api/orders/[id]/status`) that trigger shipping‑update emails.
- Six transactional email templates rendered with React Email and sent via Resend.

---

## 8. Security model (RLS + roles)

Four roles: **customer**, **seller**, **admin**, **support** (`profiles.role`).

Authorization is enforced at three layers:

1. **Middleware** (`src/middleware.ts`) gates route groups by authentication/role.
2. **Server guards** (`requireUser(roles?)`) redirect on the server before rendering.
3. **Row‑Level Security** — the real boundary. Every table has RLS enabled; policies use a
   `SECURITY DEFINER` `get_user_role()` helper. Examples: buyers see only their own orders;
   sellers see only their own products/line‑items; support/admin can read tickets;
   customers can only insert reviews/wishlist rows as themselves.

The `service_role` key is used **only** in trusted server contexts (the Stripe webhook and
a few admin aggregate reads) where RLS must be bypassed. It is never exposed to the browser.

---

## 9. Test accounts

Seeded by `supabase/seed.sql` — **all passwords `test1234!`**:

| Role | Email |
| ---- | ----- |
| Admin | `admin@aureon.io` |
| Support | `support@aureon.io` |
| Seller | `watchvault@aureon.io` (and 9 more) |
| Buyer | `buyer1@aureon.io`, `buyer2@aureon.io`, `buyer3@aureon.io` |

> These exist only in seeded/test databases. Rotate keys and remove seed users before any
> real production launch.

---

## 10. Blockchain (Phase 2)

An on-chain provenance & authenticity layer running on a **local Hardhat node** —
no testnet, no MetaMask, no browser wallet. Contracts live in `hardhat/`; the
frontend integration lives in `src/lib/blockchain/`.

### 10.1 Contracts

| Contract | Responsibility | Key functions |
| --- | --- | --- |
| `AureonAsset` (ERC-721 + AccessControl + Ownable) | The digital twin + on-chain ownership history | `mintDigitalTwin` (SELLER_ROLE), `transferAsset` (owner **or** OPERATOR_ROLE), `getProvenance` (view), `grantSellerRole`/`revokeSellerRole` (owner) |
| `AureonAttestor` (AccessControl) | One-time authenticity attestations, kept separate from ownership | `attestAuthenticity` (ATTESTOR_ROLE), `getAttestation` (view) |

`mintDigitalTwin` records a `Minted` provenance entry; `transferAsset` appends a
`Transferred` entry. `attestAuthenticity` reverts on a second attempt for the same
token. Solidity `0.8.24`, EVM target `cancun` (OpenZeppelin v5.4 uses `mcopy`).

### 10.2 The no-wallet, server-signer model

Buyers and sellers hold no keys. The platform holds **one operator key**
(`BLOCKCHAIN_OPERATOR_KEY`, defaulting to Hardhat account #0 for local dev) that
signs every state-changing call from the server:

- **Writes** (`mint`, `attest`, `transfer`) → server actions in
  `src/lib/actions/blockchain.ts` → `src/lib/blockchain/server.ts` (marked
  `server-only`, so the key can never be bundled into the browser).
- **Reads** (`getProvenance`, `getAttestation`) → unsigned, run client-side from
  `src/lib/blockchain/reads.ts` against `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL`.

Off-chain ids map to on-chain values deterministically (`src/lib/blockchain/identity.ts`):

- **productId** — `keccak256(supabase_uuid)` as a `uint256`.
- **buyer address** — `getAddress(keccak256(user_id).slice(0,42))`, so ownership is
  tracked against a stable, wallet-less address per user.

### 10.3 The Supabase ↔ chain bridge

Migration `20240101000002_blockchain.sql` adds `products.blockchain_token_id`
(+ `blockchain_minted_at`, `blockchain_attested_at`). Minting/attesting writes the
token id back here (`src/lib/data/blockchain.ts` reads it). Every read is
degrade-safe: a missing column or an offline node resolves to "not minted" rather
than throwing, so the app runs identically before and after Phase 2 is applied.

### 10.4 Integration points (hooks + components)

| UI surface | Hook | Component |
| --- | --- | --- |
| Product detail — provenance card | `useProvenance` | `ProvenanceCard` |
| My Collection — per-item certificate | `useProvenance` / `useCollection` | `CollectionCertificate` |
| Admin → Products — attest | `useAttest` | `AttestButton` |
| Seller → Listings — mint | `useMint` | `MintButton` |
| Order → delivered → transfer | — (server) | `api/orders/[id]/status` |

### 10.5 Running & testing

Setup and the exact three-terminal run order are in the README's
[Blockchain Setup](../README.md#blockchain-setup). Contract tests:

```bash
cd hardhat && npx hardhat test     # 18 passing
```

`AureonAsset.test.js` covers seller-only minting, the mint event/args,
provenance after mint and after transfer, non-owner transfer rejection, and
operator-on-behalf transfer. `AureonAttestor.test.js` covers attestor-only
attestation, the event/args, double-attest rejection, and `getAttestation` for
attested vs unattested tokens.
