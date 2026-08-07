# Aureon — *Own the Rare*

A marketplace for authenticated luxury watches, fine art, designer pieces, and rare
collectibles. Buyers browse and purchase with provenance they can trust; vetted
sellers list inventory and get paid out through Stripe Connect; admins and support
agents run the platform. Every listing can be minted as an on-chain "digital twin"
whose ownership history and authenticity attestation are recorded immutably on a
blockchain.

Built with **Next.js 16** (App Router, React 19), **Supabase** (Postgres + Auth + RLS),
**Stripe Connect**, **Resend**, **Solidity** (Hardhat), and **TypeScript**.

This is the CT124-3-3-BCD group assignment (blockchain design & development) — see
[Assignment coverage map](#assignment-coverage-map--ct124-3-3-bcd-part-2) below for
how this repo satisfies the brief.

---

## Assignment submission

| | |
| --- | --- |
| **Institution** | Asia Pacific University of Technology & Innovation (APU) |
| **Module** | CT124-3-3-BCD — Blockchain Design & Development |
| **Intake code** | APD3F2605CS |
| **Lecturer** | Mr. Law Wei Liang |
| **Deliverable** | Part 2 — Solution Development & Documentation |

**Group members**

| Name | TP number |
| --- | --- |
| Edward Fong Yu Xian | TP072942 |
| Lee Matthew | TP073972 |
| Sidi Mohamed Sid Amine | TP078039 |
| Mohammed Salim Ali Darhoub | TP080273 |

---

## Live deployment

| | |
| --- | --- |
| **App** | <https://aureon-omega-three.vercel.app/> |
| **Repo** | <https://github.com/sidim-prog/Aureon> |
| **Blockchain** | Sepolia testnet (chain id `11155111`), free public RPC — real, deployed, verified contracts: |
| — `AureonAsset` | [`0xA501825c5573127DA0152eca8Ec5783797E7d659`](https://sepolia.etherscan.io/address/0xA501825c5573127DA0152eca8Ec5783797E7d659) |
| — `AureonAttestor` | [`0x421cF8Dad15e2105074A838D3d35b109C13F02a6`](https://sepolia.etherscan.io/address/0x421cF8Dad15e2105074A838D3d35b109C13F02a6) |

The production deployment is live-data-only (real Supabase, real Stripe test-mode
checkout, real on-chain provenance) — nothing on it is mocked. Sign in with any
account from [Test accounts](#test-accounts).

---

## Table of contents

- [Assignment coverage map](#assignment-coverage-map--ct124-3-3-bcd-part-2)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Authentication](#authentication)
- [Payments (Stripe)](#payments-stripe)
- [Blockchain (Phase 2)](#blockchain-phase-2)
- [Feature reference](#feature-reference)
- [Security model](#security-model-rls--roles)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Test accounts](#test-accounts)
- [Troubleshooting](#troubleshooting)
- [Team](#team)

---

## Assignment coverage map — CT124-3-3-BCD (Part 2)

This file is the "Documentation" deliverable required by the assignment brief
(§2.3: format `.md`, explain setup, explain features). It doesn't restate the Part 1
proposal (business case / industry analysis) — that's a separate document, already
submitted. This maps Part 2's marking criteria directly onto working, deployed code.

| Marking criterion | Weight | Where it's satisfied |
| --- | --- | --- |
| Frontend built with Next.js, React | — (2.1) | [Tech stack](#tech-stack); every page under [`src/app/`](src/app) is a Next.js 16 App Router route built from React 19 components. Live at the URL above. |
| Frontend linked to a local database (Postgres) | — (2.1) | [Database](#database); [`src/lib/data/`](src/lib/data) (reads) and [`src/lib/actions/`](src/lib/actions) (writes) talk to Postgres via Supabase. Runs against **either** the hosted project **or** a fully local Postgres instance (`supabase start`). |
| Solidity smart contract deployed to a Hardhat Node (local blockchain) | — (2.1) | [Blockchain (Phase 2)](#blockchain-phase-2); contracts in [`hardhat/contracts/`](hardhat/contracts). Deployable to a local Hardhat node (`npm run deploy`) **and** already deployed live to the free Sepolia testnet (`npm run deploy:sepolia`) — see the live deployment table above. |
| Frontend linked to the Solidity smart contract | — (2.1) | [`src/lib/blockchain/`](src/lib/blockchain) (server-signed writes + client reads) and the UI components in [`src/components/blockchain/`](src/components/blockchain), all live in production right now. |
| **Front End + Database** (solution development, with code snippets) | **20%** | This file throughout, plus the snippet immediately below. |
| **Solidity** (solution development, with code snippets) | **20%** | [Blockchain (Phase 2)](#blockchain-phase-2), plus the snippet immediately below. |

**Front End + Database — a real code path** (reading a product for the browse page,
[`src/lib/data/products.ts`](src/lib/data/products.ts)):

```ts
export async function getProducts(query: ProductQuery = {}): Promise<ProductVM[]> {
  const supabase = await createSupabaseServerClient()

  let q = supabase.from("products").select(select).eq("status", "active")

  if (query.categorySlug) q = q.eq("categories.slug", query.categorySlug)
  if (query.sellerId) q = q.eq("seller_id", query.sellerId)
  if (query.minPrice != null) q = q.gte("price", Math.round(query.minPrice * 100))
  if (query.maxPrice != null) q = q.lte("price", Math.round(query.maxPrice * 100))
  // …search / trending / featured filters, then:

  const { data } = await q
  return (data ?? []).map(toProductVM) // raw row → UI-shaped view-model (cents → dollars, etc.)
}
```

React Server Components call this directly (no separate REST layer needed) — see
[`src/app/(shop)/browse/page.tsx`](<src/app/(shop)/browse/page.tsx>).

**Solidity — a real code path** (minting a digital twin,
[`hardhat/contracts/AureonAsset.sol`](hardhat/contracts/AureonAsset.sol)):

```solidity
function mintDigitalTwin(uint256 productId, address owner, string memory metadataUri)
    external
    onlyRole(SELLER_ROLE)
    returns (uint256 tokenId)
{
    require(tokenOfProduct[productId] == 0, "AureonAsset: product already minted");
    require(owner != address(0), "AureonAsset: mint to zero address");

    tokenId = _nextTokenId++;
    _safeMint(owner, tokenId);
    _assets[tokenId] = AssetInfo({ productId: productId, seller: owner, mintedAt: block.timestamp, metadataUri: metadataUri });
    // …records a `Minted` provenance entry, emits an event
}
```

Called server-side via the platform's operator key (`src/lib/blockchain/server.ts`) when
a seller clicks "Mint Digital Twin" on their listing — see
[Blockchain (Phase 2)](#blockchain-phase-2) for why buyers/sellers never need their own
wallet.

**Submission checklist** (§2.3 of the brief):
- Documentation (`.md`, this file): setup guide below; feature reference below. ✅
- Code: frontend → `src/`, `public/`, config files at repo root; Hardhat →
  `hardhat/` (contracts, tests, deployment scripts). Remove `node_modules/` from
  both before zipping.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, Radix UI primitives, Framer Motion |
| Database / Auth | Supabase (Postgres, Auth, Storage, Row-Level Security) |
| Payments | Stripe — Payment Element, Connect (Standard accounts), webhooks |
| Email | Resend + React Email (`@react-email/components`) |
| Blockchain | Solidity 0.8.24, Hardhat, OpenZeppelin (ERC-721 + AccessControl), ethers.js |
| Client state | Zustand (cart, notifications), TanStack Query (session) |
| Validation | Zod (env, forms, server actions) |
| Charts | Recharts |

---

## Quick start

```bash
git clone https://github.com/sidim-prog/Aureon.git
cd Aureon
npm install
cp .env.example .env.local
# fill in .env.local — see Environment variables below;
# at minimum the three Supabase keys are needed to boot
npm run dev
```

Open <http://localhost:3000>. The app reads live data from Supabase — a configured
`.env.local` is required.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build (runs a full type check) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over the repo |

---

## Environment variables

Every variable is documented inline in [`.env.example`](.env.example). Copy it to
`.env.local` and fill in what you need — the app validates the whole set at startup
in [`src/lib/env.ts`](src/lib/env.ts) and fails loudly rather than misbehaving later.

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Always | Public origin. Drives OAuth and email redirect links. |
| `DEVELOPMENT_MODE` / `NEXT_PUBLIC_DEVELOPMENT_MODE` | Optional | Toggles dev banners only; keep both identical, `false` in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, data | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth, data | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, admin writes | **Server only.** Bypasses RLS — never expose to the browser. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout | `pk_test_…` (sandbox) |
| `STRIPE_SECRET_KEY` | Checkout | `sk_test_…`, server only |
| `STRIPE_WEBHOOK_SECRET` | Order status updates | Per-endpoint; differs between local and production |
| `STRIPE_PLATFORM_FEE_PERCENT` | Payouts | Marketplace fee %, default `10` |
| `RESEND_API_KEY` | Transactional email | |
| `RESEND_FROM_EMAIL` | Transactional email | Must be on a domain verified in Resend, or falls back to `onboarding@resend.dev` (only delivers to the account owner's own inbox) |
| `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL` | Blockchain reads | Defaults to local Hardhat (`http://127.0.0.1:8545`); set to the Sepolia RPC to use the live deployed contracts |
| `NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID` | Blockchain reads | `31337` local / `11155111` Sepolia |
| `BLOCKCHAIN_OPERATOR_KEY` | Blockchain writes | Server-only signer for mint/attest/transfer. Defaults to Hardhat's well-known local account #0 key |

Each integration degrades gracefully: with no Stripe keys the checkout API returns
`503`; with no Resend key emails are logged and skipped; with no blockchain config the
UI clearly shows "not available" instead of erroring or faking success. The app never
crashes on a missing optional key.

Google and Apple OAuth credentials are configured **in the Supabase dashboard**
(Authentication → Providers), not in env — the app just calls
`supabase.auth.signInWithOAuth`. For Google: create an OAuth 2.0 Client ID in Google
Cloud Console with authorised redirect URI
`https://<project-ref>.supabase.co/auth/v1/callback` (the *Supabase* callback, not the
app's), then paste the Client ID/Secret into Supabase → Providers → Google. Apple
needs a paid Apple Developer account (Services ID + Sign in with Apple key) — same
idea, configured under Providers → Apple.

---

## Database

Schema and seed data live in [`supabase/`](supabase/).

- `migrations/20240101000000_initial_schema.sql` — 14 tables, enums, indexes
  (including a full-text index on products), triggers, and Row Level Security
  policies for all four roles.
- `migrations/20240101000001_fix_orders_policy_recursion.sql` — fixes an RLS
  recursion bug in the orders policy.
- `migrations/20240101000002_blockchain.sql` — Phase 2: adds
  `products.blockchain_token_id` (+ `minted_at`/`attested_at`), the bridge to
  on-chain provenance.
- `migrations/20240101000003_product_views.sql` — the `increment_product_view`
  RPC backing the live view counters shown on product cards and the seller
  dashboard.
- `seed.sql` — 20 users, 10 sellers, 6 categories, 50 products, orders, reviews,
  and support tickets. Every seeded account uses the password `test1234!`.

Key schema details worth knowing:

- **Money is stored in cents** as `BIGINT` throughout (`products.price`,
  `orders.total_amount`, `order_items.price`). Divide by 100 only at render time.
- `handle_new_user()` fires on `auth.users` insert and creates the matching
  `public.profiles` row, copying `full_name` and `avatar_url` from the signup
  metadata. Sign-up does not need to create profiles by hand.
- `get_user_role()` is a `SECURITY DEFINER` function that RLS policies call to check
  the caller's role without recursing into `profiles`.
- Triggers keep `seller_profiles.rating` / `review_count`, `products.wishlist_count`,
  and `products.view_count` in sync automatically.

Running migrations locally:

```bash
supabase start          # local Postgres, Studio, and Inbucket (email catcher)
supabase db reset       # apply migrations + seed from scratch
```

Pushing to the hosted project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Verify RLS actually took effect (the single most likely security mistake here) —
every row must show `rowsecurity = true`:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

---

## Authentication

Supabase Auth with cookie-based sessions via `@supabase/ssr`.

**Supported flows:** email + password sign-up (with verification), sign-in, sign-out,
password reset, and OAuth via Google and Apple.

| Piece | Location |
| --- | --- |
| Server actions (sign in/up/out, reset, update password) | `src/lib/auth/actions.ts` |
| Server-side session + role guard | `src/lib/auth/session.ts` |
| Client session hook | `src/hooks/use-user.ts` |
| OAuth kick-off (client, PKCE) | `src/lib/auth/oauth.ts` |
| OAuth + email-confirmation landing | `src/app/auth/callback/route.ts` |
| `token_hash` email links (verify, recovery) | `src/app/auth/confirm/route.ts` |
| Route protection by role | `src/middleware.ts` |

**Three rules to keep in mind when building on this:**

1. On the server, always read the user through `getSessionUser()` — it calls
   `supabase.auth.getUser()`, which revalidates the JWT with Supabase. Never trust
   `getSession()` server-side; its contents come straight from the cookie.
2. Guard server components with `requireUser(["seller", "admin"])`. Middleware
   already blocks the guarded route prefixes, but the second check costs nothing and
   covers anything rendered outside those paths — and matters if the middleware
   layer ever fails open on a transient error (it's designed to, deliberately,
   rather than bounce a real user to the wrong page — RLS is still the real
   boundary underneath both).
3. OAuth must start in the browser. The PKCE verifier is generated client-side and
   stored in a cookie that `/auth/callback` reads back.

**Route guards** (`src/middleware.ts`):

| Prefix | Allowed roles |
| --- | --- |
| `/account` | customer, seller, admin, support |
| `/seller` | seller, admin, support |
| `/admin` | admin |
| `/support` | support, admin |

After signing in, users land on their role's home: `/account`, `/seller`, `/admin`,
or `/support` (see `ROLE_HOME` in `src/lib/config.ts`).

**Email templates**: the Supabase defaults are broken for this app — the default
link goes to GoTrue's `/auth/v1/verify`, which returns the session in a URL
*fragment*, and fragments never reach the server, so the route handler can't see the
token. Use `.TokenHash` (not `.ConfirmationURL`) pointed at
`/auth/confirm?token_hash={{ .TokenHash }}&type=...&next=...` — see
`supabase/templates/` for the working versions.

---

## Payments (Stripe)

Stripe Connect (Standard accounts) handles checkout and seller payouts. Currently
running in **sandbox/test mode** — no real charges, test cards only
(`4242 4242 4242 4242`, any future expiry/CVC).

### Checkout — `POST /api/checkout`
`src/app/api/checkout/route.ts`

- Accepts `{ items: [{ productId, qty }] }`. The client never sends prices.
- **Recomputes every price server-side** from Supabase — this is the security
  boundary against tampered totals.
- Adds the platform fee and creates a Stripe **PaymentIntent** for the total. Line
  items (with each item's `sellerId`) and the buyer id are stored in the
  PaymentIntent `metadata` so the webhook can build the order later.
- Returns `client_secret`; the checkout page renders the Stripe **Payment Element**
  and calls `stripe.confirmPayment()`.

### Webhook — `POST /api/webhooks/stripe`
`src/app/api/webhooks/stripe/route.tsx` — the source of truth for orders. Verifies
the Stripe signature, then handles exactly three event types:

- `payment_intent.succeeded` → creates the `orders` row and `order_items`
  (idempotently), then fans out **per-seller transfers**.
- `payment_intent.payment_failed` → notifies the buyer.
- `charge.refunded` → flips the matching order to `refunded` and notifies the buyer
  (covers refunds issued directly from the Stripe dashboard, distinct from the
  in-app refund flow below).

### Refunds — `POST /api/orders/[id]/refund`
- **Admins** can refund any order; **sellers** can refund only orders that contain
  one of their own line items.
- Issues a real Stripe refund against the order's PaymentIntent, **reverses the
  seller's Connect transfer** for that order (so a seller can't refund a buyer and
  keep the payout), and marks the order `refunded`.

### Seller payouts — Stripe Connect
`src/lib/stripe/connect.ts`, `src/app/api/seller/connect/route.ts`,
`src/app/seller/payouts/page.tsx` — a seller clicks **Set up payouts**, the app
creates a Connect Standard account (or reuses the existing one) and redirects to
Stripe's hosted onboarding. A cart can span multiple sellers but a PaymentIntent can
only target one account, so the full charge goes to the platform, and after payment
succeeds the webhook creates a `Transfer` per seller (subtotal minus the platform
fee) via `transfer_group` = the PaymentIntent id.

**Why Standard, not Express/Custom**: this project's Stripe account is registered in
a region where Stripe blocks platforms from creating loss-liable connected account
types.

### Local webhook testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_… into STRIPE_WEBHOOK_SECRET, restart npm run dev
```

---

## Blockchain (Phase 2)

An on-chain **provenance & authenticity** layer: every listing can be minted as a
unique ERC-721 "digital twin" whose ownership history and authenticity attestation
are recorded immutably on-chain. Contracts live in [`hardhat/`](hardhat/); the
frontend integration lives in [`src/lib/blockchain/`](src/lib/blockchain/).

Runs against **either** a local Hardhat node (assignment requirement, zero setup,
zero cost) **or** the free public Sepolia testnet (also zero cost, and what's
currently live in production — see [Live deployment](#live-deployment)). No code
changes are needed to switch — only env vars.

### Contracts (`hardhat/contracts/`)

| Contract | Responsibility | Key functions |
| --- | --- | --- |
| `AureonAsset` (ERC-721 + AccessControl + Ownable) | The digital twin + on-chain ownership history | `mintDigitalTwin` (SELLER_ROLE), `transferAsset` (owner **or** OPERATOR_ROLE), `getProvenance` (view), `grantSellerRole`/`revokeSellerRole` (owner) |
| `AureonAttestor` (AccessControl) | One-time authenticity attestations, kept separate from ownership | `attestAuthenticity` (ATTESTOR_ROLE), `getAttestation` (view) |

`mintDigitalTwin` records a `Minted` provenance entry; `transferAsset` appends a
`Transferred` entry. `attestAuthenticity` reverts on a second attempt for the same
token. Solidity `0.8.24`, EVM target `cancun` (OpenZeppelin v5.4 uses `mcopy`).

### The no-wallet, server-signer model

Buyers and sellers hold no keys. The platform holds **one operator key**
(`BLOCKCHAIN_OPERATOR_KEY`) that signs every state-changing call from the server:

- **Writes** (`mint`, `attest`, `transfer`) → server actions in
  `src/lib/actions/blockchain.ts` → `src/lib/blockchain/server.ts` (marked
  `server-only`, so the key can never be bundled into the browser).
- **Reads** (`getProvenance`, `getAttestation`) → unsigned, run client-side from
  `src/lib/blockchain/reads.ts` against `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL`.

Off-chain ids map to on-chain values deterministically
(`src/lib/blockchain/identity.ts`):

- **productId** — `keccak256(supabase_uuid)` as a `uint256`.
- **buyer address** — `getAddress(keccak256(user_id).slice(0,42))`, so ownership is
  tracked against a stable, wallet-less address per user.

### The Supabase ↔ chain bridge

Migration `20240101000002_blockchain.sql` adds `products.blockchain_token_id`
(+ `blockchain_minted_at`, `blockchain_attested_at`). Minting/attesting writes the
token id back here. Every read is degrade-safe: a genuinely unminted item, a
not-yet-reachable chain, and an offline node are each shown as distinct, honest
states — never faked as success.

### Integration points (hooks + components)

| UI surface | Hook | Component |
| --- | --- | --- |
| Product detail — provenance card | `useProvenance` | `ProvenanceCard` |
| My Collection — per-item certificate | `useProvenance` | `CollectionCertificate` |
| Admin → Products — attest | `useAttest` | `AttestButton` |
| Seller → Listings — mint | `useMint` | `MintButton` |
| Order → delivered → transfer | — (server) | `api/orders/[id]/status` |

### Running it — local Hardhat node

```bash
cd hardhat && npm install               # first time only

# Terminal 1
npx hardhat node

# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/seed-demo.js --network localhost

# Terminal 3
npm run dev
```

`deploy.js` writes contract addresses + ABIs to
[`src/lib/blockchain/deployments.json`](src/lib/blockchain/deployments.json)
automatically. `seed-demo.js` mints 5 digital twins from real Supabase products,
attests 3, transfers 1 (simulating a delivery), and writes the token ids back to
Supabase — so provenance is visible immediately at <http://localhost:3000>.

### Running it — Sepolia testnet (free, no local node needed)

```bash
cd hardhat
cp .env.example .env
# generate a throwaway key: node -e "console.log(require('ethers').Wallet.createRandom())"
# put its privateKey in .env as DEPLOYER_KEY
# fund that address with free test ETH: https://cloud.google.com/application/web3/faucet/ethereum/sepolia

npm run deploy:sepolia
npx hardhat run scripts/seed-demo.js --network sepolia
```

`hardhat.config.js` already points `sepolia` at a free public RPC
(`https://ethereum-sepolia-rpc.publicnode.com`, no signup needed) unless you set your
own `SEPOLIA_RPC_URL`. Set the matching `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL` (same URL),
`NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID=11155111`, and `BLOCKCHAIN_OPERATOR_KEY` (same as
`DEPLOYER_KEY`) in the app's `.env.local` / Vercel env vars, then commit the updated
`deployments.json`.

### Tests

```bash
cd hardhat && npx hardhat test     # 18 passing
```

`AureonAsset.test.js` covers seller-only minting, the mint event/args, provenance
after mint and after transfer, non-owner transfer rejection, and operator-on-behalf
transfer. `AureonAttestor.test.js` covers attestor-only attestation, the event/args,
double-attest rejection, and `getAttestation` for attested vs unattested tokens.

---

## Feature reference

### Customer
- **Browse** (`/browse`) — full catalog with search, category/condition/price-range
  filters, and sorting, hydrated from live products.
- **Product detail** (`/product/[slug]`) — gallery, attributes, on-chain provenance
  card, seller card, reviews with average rating, related items, add-to-cart, and
  wishlist toggle. View counts are a real, atomic DB counter, not a static number.
- **Cart & checkout** — Zustand cart (persisted) → three-step checkout (shipping →
  Stripe Payment Element → review) → success page. Totals are recomputed server-side.
- **Orders** (`/account/orders`) — real order history with line items and status.
- **Wishlist** (`/account/wishlist`) — saved items with sort, price-drop detection,
  and one-click add-all-to-cart; remove is a real mutation.
- **My Collection** (`/account/collection`) — owned items from fulfilled orders,
  each showing its real on-chain mint/attestation/ownership state.
- **Profile settings** (`/account/profile`) — edit profile + avatar upload to
  Supabase Storage.
- **Reviews** — customers can leave/update a review per product, gated to verified
  purchasers.

### Seller
- **Dashboard** (`/seller`) — revenue (net of platform fee), sales, active
  listings, rating, monthly revenue chart, recent orders, top listings.
- **Listings** (`/seller/products`, `/seller/products/new`) — create listings
  (draft or submit-for-review) and delete, all persisted to Supabase.
- **Orders** (`/seller/orders`) — per-seller line items, mark-shipped action,
  refund controls.
- **Analytics** (`/seller/analytics`) — revenue, category mix, top performers.
- **Payouts** (`/seller/payouts`) — Stripe Connect onboarding + live account status.
- **Apply** (`/seller/apply`) — become a seller; creates a seller profile (pending
  verification) and promotes the account role. Support agents who apply keep their
  `support` role and full staff access, in addition to the seller hub.

### Admin
- **Overview** (`/admin`) — platform users, sellers, GMV, orders, pending
  verifications (real counts, not placeholders), monthly GMV chart, top sellers.
- **Products / Users** (`/admin/products`, `/admin/users`) — moderation views with
  a real pending-review queue and real ban status.
- **Orders** (`/admin/orders`) — platform-wide orders with refund capability.
- **Seller verification** — verifies a pending seller, emails them the approval,
  and notifies them in-app.

### Support
- **Inbox** (`/support`) — all tickets with open/in-progress/resolved counts.
- **Ticket detail** (`/support/tickets/[id]`) — threaded conversation, public
  replies vs internal notes, canned responses, and status management. A customer
  replying to a resolved ticket reopens it automatically.

### Cross-cutting
- Real in-app notifications for every state change that matters (order shipped/
  delivered/refunded, new sale, ticket reply, seller approved) — independent of
  whether the matching email actually delivers.
- Six transactional email templates rendered with React Email and sent via Resend.

---

## Security model (RLS + roles)

Four roles: **customer**, **seller**, **admin**, **support** (`profiles.role`).

Authorization is enforced at three layers:

1. **Middleware** (`src/middleware.ts`) gates route groups by authentication/role.
2. **Server guards** (`requireUser(roles?)`) redirect on the server before
   rendering — the second line of defence for anything rendered outside a guarded
   path.
3. **Row-Level Security** — the real boundary. Every table has RLS enabled;
   policies use a `SECURITY DEFINER` `get_user_role()` helper. Examples: buyers see
   only their own orders; sellers see only their own products/line-items;
   support/admin can read tickets; customers can only insert reviews/wishlist rows
   as themselves.

The `service_role` key is used **only** in trusted server contexts (the Stripe
webhook and a few admin aggregate reads) where RLS must be bypassed. It is never
exposed to the browser.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/          sign-in, sign-up, forgot-password, reset-password
│   ├── (shop)/           browse, product, checkout, sellers, legal, marketing
│   ├── account/          customer area — orders, wishlist, collection, profile
│   ├── seller/           seller dashboard — products, orders, analytics, payouts
│   ├── admin/            admin dashboard — users, products, sellers, orders
│   ├── support/          support agent ticket inbox
│   ├── auth/             OAuth callback + email-link confirmation routes
│   └── api/               route handlers
├── components/
│   ├── auth/             OAuth buttons
│   ├── blockchain/       mint/attest buttons, provenance card, collection certificate
│   ├── ui/                shadcn-style primitives
│   ├── layout/           header, footer, search, notifications
│   ├── brand/             logo, gradients, page transitions
│   ├── marketing/        landing page sections
│   ├── shop/              product card, cart sidebar
│   ├── dashboard/        revenue chart
│   └── orders/            refund/mark-shipped/mark-delivered buttons
├── lib/
│   ├── auth/              actions, session, schemas, OAuth, shared types
│   ├── supabase/          browser, server, and middleware clients
│   ├── data/               server-only Supabase queries + view-model mappers
│   ├── actions/            server actions (wishlist, products, reviews, tickets, seller, blockchain)
│   ├── stripe/             Stripe server client + Connect helpers
│   ├── blockchain/        contract config, server signer, client reads, hooks
│   ├── email/              Resend client
│   ├── config.ts           feature flags derived from env
│   └── env.ts               validated environment (zod)
├── emails/                React Email transactional templates
├── stores/                zustand — cart, notifications
├── hooks/                 useUser
└── types/database.ts      hand-maintained Supabase types

hardhat/
├── contracts/             AureonAsset.sol, AureonAttestor.sol
├── scripts/                deploy.js, seed-demo.js
└── test/                   18 passing Hardhat tests
```

---

## Deployment

The app deploys to **Vercel** (currently live — see
[Live deployment](#live-deployment)). Steps to deploy your own copy, all free tier:

### 1. Import the repository

Go to <https://vercel.com/new>, import the repo. Leave build settings on the
Next.js defaults (`npm run build`, output `.next`). **Don't deploy yet** — add env
vars first or the build fails on env validation.

### 2. Environment variables

**Project Settings → Environment Variables**, add every variable from
[Environment variables](#environment-variables) above for Production + Preview +
Development. `NEXT_PUBLIC_*` values are inlined at build time — changing one needs
a redeploy, not just a restart.

### 3. Deploy

Note the real URL Vercel assigns (the stable one without a random hash in it —
check **Settings → Domains** for the "Production" alias if you deployed via git push
and only see a deployment-specific URL).

### 4. Point Supabase at the deployed URL

Supabase dashboard → **Authentication → URL Configuration**:
- Site URL: `https://<your-domain>`
- Redirect URLs: `https://<your-domain>/auth/callback`,
  `https://<your-domain>/auth/confirm`, and the wildcard
  `https://*-<your-vercel-team>.vercel.app/auth/callback` (covers preview deploys)

### 5. Point Stripe at the deployed URL

Stripe Dashboard (Sandbox) → **Developers → Webhooks → Add endpoint**:
- Scope: **Your account** (not "Connected accounts" — this app charges through the
  platform account and pays sellers via separate transfers, so all relevant events
  fire on the platform's own account)
- URL: `https://<your-domain>/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`,
  `charge.refunded` (exactly what `src/app/api/webhooks/stripe/route.tsx` handles —
  no others needed)
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel, redeploy.

### 6. Blockchain

Either leave `BLOCKCHAIN_*` env vars unset (the app degrades gracefully — see
[Blockchain (Phase 2)](#blockchain-phase-2)) and demo that part locally, or deploy
to Sepolia and set the three blockchain env vars — both are free. Commit
`src/lib/blockchain/deployments.json` after deploying so Vercel's build (which runs
from git, not your local disk) picks up the contract addresses.

### 7. Verify

- Sign in with `admin@aureon.io` → redirected to `/admin`
- Signed out, visiting `/admin` redirects away
- Browse/product pages show real seeded products
- A minted product shows real Minted → Attested → Transferred history

### Rollback

Vercel keeps every previous deployment — **Deployments → ⋯ → Promote to
Production** on the last good build rolls back instantly. Database migrations do
**not** roll back with it — write a new corrective migration rather than editing an
applied one.

---

## Test accounts

Seeded by `supabase/seed.sql` — **all passwords `test1234!`**:

| Role | Email |
| --- | --- |
| Admin | `admin@aureon.io` |
| Support | `support@aureon.io` |
| Seller | `watchvault@aureon.io` (and 9 more) |
| Buyer | `buyer1@aureon.io`, `buyer2@aureon.io`, `buyer3@aureon.io` |

> These exist only in the seeded/test database. Rotate keys and remove seed users
> before any real production launch beyond this assignment.

---

## Troubleshooting

**`redirect_uri_mismatch` from Google** — the redirect URI in Google Cloud must be
the *Supabase* callback (`https://<project-ref>.supabase.co/auth/v1/callback`), not
an app URL, matching character for character.

**OAuth returns to `/sign-in?error=...`** — the URL the provider sent the browser
back to isn't in Supabase's Redirect URLs allow-list.

**"Invalid login credentials" for a seeded account** — either the seed didn't run,
or email confirmation is on and the seeded `email_confirmed_at` didn't stick:
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@aureon.io';
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
```

**Signed in, but queries return empty arrays** — RLS is doing its job and the
policy doesn't match; check the user's role in `public.profiles`. `products` only
exposes `status = 'active'` rows to ordinary users — a seller's own drafts are
visible to that seller alone.

**Session vanishes on refresh** — confirm `src/middleware.ts` still calls
`supabase.auth.getUser()` on every matched request; that call looks redundant but
is what rotates the auth cookie.

**`Invalid environment variables` on boot** — `src/lib/env.ts` validation failed;
the error names the offending variable. Usually a `NEXT_PUBLIC_SUPABASE_URL`
missing the `https://` scheme.

**Changed a `NEXT_PUBLIC_*` value and nothing happened** — those are inlined at
build time. Restart the dev server locally; redeploy on Vercel.

**Email links point at the wrong port locally** — links are built from
`NEXT_PUBLIC_APP_URL`. If port 3000 is already taken, `next dev` falls back to
3001 and emailed links go to the wrong app — free port 3000 first, or update the
env var to match.

**`supabase db reset` says "supabase start is not running"** — the local stack
isn't up: start Docker Desktop, then `supabase start`.

---

## Team

Asia Pacific University of Technology & Innovation (APU) — CT124-3-3-BCD, intake
**APD3F2605CS**, supervised by **Mr. Law Wei Liang**.

| Name | TP number | Area of responsibility |
| --- | --- | --- |
| Sidi Mohamed Sid Amine | TP078039 | Supabase, auth, deployment |
| Lee Matthew | TP073972 | Customer-facing pages |
| Mohammed Salim Ali Darhoub | TP080273 | Stripe, seller + admin dashboards |
| Edward Fong Yu Xian | TP072942 | Email, support area, documentation |

Work happens on per-person branches and merges to `main` via pull request. Commits
follow [Conventional Commits](https://www.conventionalcommits.org/).
