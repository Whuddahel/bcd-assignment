# Aureon — *Own the Rare*

A marketplace for authenticated luxury watches, fine art, designer pieces, and rare
collectibles. Buyers browse and purchase with provenance they can trust; vetted
sellers list inventory and get paid out through Stripe Connect; admins and support
agents run the platform.

Built with **Next.js 16** (App Router, React 19), **Supabase** (Postgres + Auth + RLS),
**Stripe Connect**, **Resend**, **Tailwind v4**, and **TypeScript**.

---

## Table of contents

- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Live data & service configuration](#live-data--service-configuration)
- [Database](#database)
- [Blockchain (Phase 2)](#blockchain-phase-2)
- [Authentication](#authentication)
- [Project structure](#project-structure)
- [Deployment](#deployment)

> **Full system documentation** (setup guide + feature reference + dashboard checklists):
> see [`DOCUMENTATION.md`](DOCUMENTATION.md).

---

## Quick start

```bash
git clone https://github.com/Whuddahel/bcd-assignment.git
cd bcd-assignment
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. The app reads live data from Supabase, so a configured
`.env.local` (at minimum the Supabase keys) is required — see
[Environment variables](#environment-variables) and
[`DOCUMENTATION.md`](DOCUMENTATION.md) §3.

To provision a real Supabase project, follow
[docs/supabase-setup.md](docs/supabase-setup.md).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over the repo |
| `npm run commit` | Commitizen prompt (conventional commits) |

---

## Environment variables

Every variable is documented inline in [`.env.example`](.env.example). Copy it to
`.env.local` and fill in what you need — the app validates the whole set at startup
in [`src/lib/env.ts`](src/lib/env.ts) and fails loudly rather than misbehaving later.

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Always | Public origin. Drives OAuth and email redirect links. |
| `DEVELOPMENT_MODE` | Optional | Toggles dev banners only; set `false` in production. |
| `NEXT_PUBLIC_DEVELOPMENT_MODE` | Optional | Client-visible mirror — **keep identical** to the above. |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, data | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth, data | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, admin writes | **Server only.** Never expose to the browser. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout | |
| `STRIPE_SECRET_KEY` | Checkout | Server only. |
| `STRIPE_WEBHOOK_SECRET` | Order status updates | Per-endpoint; differs between local and production. |
| `STRIPE_PLATFORM_FEE_PERCENT` | Payouts | Platform cut per transaction. Defaults to `10`. |
| `RESEND_API_KEY` | Transactional email | |
| `RESEND_FROM_EMAIL` | Transactional email | Must be on a domain verified in Resend. |

Google and Apple OAuth credentials are configured **in the Supabase dashboard**, not
here. The entries in `.env.example` exist only so the values are documented in one
place; the app never reads them.

---

## Live data & service configuration

The app is **live‑data only**: every page reads from Supabase through the server‑only
data layer in [`src/lib/data/`](src/lib/data/). The former static mock catalog and the
dev role‑switcher have been removed. See [`DOCUMENTATION.md`](DOCUMENTATION.md) for the
full architecture and feature reference.

Each external service degrades gracefully when its keys are absent, so integrations can
be brought up one at a time:

| Service | Keys absent | Keys present |
| --- | --- | --- |
| Supabase | App can't fetch data (required) | Real data, auth, and RLS |
| Stripe | `/api/checkout` returns `503` | Real Payment Element + webhooks + Connect |
| Resend | Emails are logged and skipped | Real transactional email |

`DEVELOPMENT_MODE` now only toggles developer banners and should be `false` in
production. The capability flags live in [`src/lib/config.ts`](src/lib/config.ts):
`hasSupabase`, `hasStripe`, `hasResend`, `useLiveData` (`= hasSupabase`), and
`useMockAuth` (a defensive fallback that is inert whenever Supabase is configured).

---

## Database

Schema and seed data live in [`supabase/`](supabase/).

- `migrations/20240101000000_initial_schema.sql` — 14 tables, enums, indexes
  (including a full-text index on products), triggers, and Row Level Security
  policies for all four roles.
- `migrations/20240101000002_blockchain.sql` — **Phase 2**: adds
  `products.blockchain_token_id` (+ `minted_at`/`attested_at`), the bridge to the
  on-chain provenance. See [Blockchain (Phase 2)](#blockchain-phase-2).
- `seed.sql` — 20 users, 10 sellers, 6 categories, 50 products, orders, reviews, and
  support tickets. Every seeded account uses the password `test1234!`.
- `config.toml` — Supabase CLI configuration for the local stack.

Key schema details worth knowing:

- **Money is stored in cents** as `BIGINT` throughout (`products.price`,
  `orders.total_amount`, `order_items.price`). Divide by 100 only at render time.
- `handle_new_user()` fires on `auth.users` insert and creates the matching
  `public.profiles` row, copying `full_name` and `avatar_url` from the signup
  metadata. Sign-up does not need to create profiles by hand.
- `get_user_role()` is a `SECURITY DEFINER` function that RLS policies call to check
  the caller's role without recursing into `profiles`.
- Triggers keep `seller_profiles.rating` / `review_count` and
  `products.wishlist_count` in sync automatically.

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

See [docs/supabase-setup.md](docs/supabase-setup.md) for the full walkthrough.

---

## Blockchain (Phase 2)

Phase 2 adds an on-chain **provenance & authenticity** layer: every listing can be
minted as a unique ERC-721 "digital twin" whose ownership history and authenticity
attestation are recorded immutably on-chain. It runs entirely on a **local Hardhat
node** — no testnet, no MetaMask, no browser wallet. All contracts live in
[`hardhat/`](hardhat/); the frontend integration lives in
[`src/lib/blockchain/`](src/lib/blockchain/).

**Contracts** ([hardhat/contracts/](hardhat/contracts/)):

- `AureonAsset.sol` — ERC-721 digital twin. `mintDigitalTwin` (sellers),
  `transferAsset` (owner or platform operator — called automatically on delivery),
  `getProvenance` (public), plus `grantSellerRole`/`revokeSellerRole` via OpenZeppelin
  `AccessControl` + `Ownable`.
- `AureonAttestor.sol` — one-time authenticity attestations. `attestAuthenticity`
  (admins only), `getAttestation` (public).

**No wallets, by design.** Buyers and sellers have no keys. The platform holds a
single **server-side operator key** (Hardhat account #0 in local dev) that signs all
platform actions — mint, attest, transfer — from server actions. The private key
never reaches the browser. Reads (`getProvenance`, `getAttestation`) are unsigned and
run straight from the client. Buyer "addresses" are derived deterministically from
their Supabase user id, so ownership works without anyone holding a wallet.

### Blockchain Setup

Apply the Phase 2 migration once (adds the token-id bridge column):

```bash
supabase db push      # or paste supabase/migrations/20240101000002_blockchain.sql
                      # into the Supabase SQL editor
```

Install the Hardhat toolchain the first time:

```bash
cd hardhat && npm install
```

Then run the three terminals **in order**:

```bash
# Terminal 1 — start the local blockchain
cd hardhat
npx hardhat node

# Terminal 2 — deploy contracts, then seed demo provenance
cd hardhat
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/seed-demo.js --network localhost

# Terminal 3 — start the app
npm run dev
```

Open <http://localhost:3000>. `deploy.js` writes the contract addresses + ABIs to
[`src/lib/blockchain/deployments.json`](src/lib/blockchain/deployments.json)
automatically (no copy-paste), and `seed-demo.js` mints 5 twins, attests 3, transfers
1, and writes the token ids back into Supabase — so provenance is visible immediately.

Run the contract tests any time with:

```bash
cd hardhat && npx hardhat test     # 18 passing
```

Where it shows up in the UI:

| Placeholder | Now | Component |
| --- | --- | --- |
| Product detail — provenance card | Live chain of custody + attestation badge | `ProvenanceCard` |
| My Collection — certificate | On-chain ownership verification per item | `CollectionCertificate` |
| Admin → Products — attest | "Attest Authenticity" button | `AttestButton` |
| Seller → Listings — mint | "Mint Digital Twin" button | `MintButton` |
| Order delivered | Auto `transferAsset` to buyer | `api/orders/[id]/status` |

> Everything degrades gracefully: if the node isn't running or a product isn't
> minted, the UI shows a clean "not yet on blockchain" state instead of erroring.

The config is structured to add a real network later (see the commented `sepolia`
block in [hardhat.config.js](hardhat/hardhat.config.js)) without touching app code.

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
   `supabase.auth.getUser()`, which revalidates the JWT with Supabase.
   Never trust `getSession()` server-side; its contents come straight from the cookie.
2. Guard server components with `requireUser(["seller", "admin"])`. Middleware
   already blocks the guarded route prefixes, but the second check costs nothing and
   covers anything rendered outside those paths.
3. OAuth must start in the browser. The PKCE verifier is generated client-side and
   stored in a cookie that `/auth/callback` reads back.

**Route guards** (`src/middleware.ts`):

| Prefix | Allowed roles |
| --- | --- |
| `/account` | customer, seller, admin, support |
| `/seller` | seller, admin |
| `/admin` | admin |
| `/support` | support, admin |

After signing in, users land on their role's home: `/account`, `/seller`, `/admin`,
or `/support` (see `ROLE_HOME` in `src/lib/config.ts`).

**Test accounts** (after seeding, password `test1234!`):

| Email | Role |
| --- | --- |
| `admin@aureon.io` | admin |
| `support@aureon.io` | support |
| `watchvault@aureon.io` | seller |
| `buyer1@aureon.io` | customer |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/          sign-in, sign-up, forgot-password, reset-password
│   ├── (shop)/          browse, product, checkout, sellers, legal, marketing
│   ├── account/         customer area — orders, wishlist, collection, profile
│   ├── seller/          seller dashboard — products, orders, analytics
│   ├── admin/           admin dashboard — users, products
│   ├── support/         support agent ticket inbox
│   ├── auth/            OAuth callback + email-link confirmation routes
│   └── api/             route handlers
├── components/
│   ├── auth/            OAuth buttons
│   ├── ui/              shadcn-style primitives
│   ├── layout/          header, footer, search, notifications
│   ├── brand/           logo, gradients, page transitions
│   ├── marketing/       landing page sections
│   ├── shop/            product card, cart sidebar
│   ├── dashboard/       revenue chart
│   └── orders/          refund button, connect payouts button
├── lib/
│   ├── auth/            actions, session, schemas, OAuth, shared types
│   ├── supabase/        browser, server, and middleware clients
│   ├── data/            server-only Supabase queries + view-model mappers
│   ├── actions/         server actions (wishlist, products, reviews, tickets, seller)
│   ├── stripe/          Stripe server client + Connect helpers
│   ├── email/           Resend client
│   ├── config.ts        feature flags derived from env
│   └── env.ts           validated environment (zod)
├── emails/              React Email transactional templates
├── stores/              zustand — cart, notifications
├── hooks/               useUser
└── types/database.ts    hand-maintained Supabase types
```

---

## Deployment

The app deploys to **Vercel**. Everything below assumes a Supabase project already
exists — if not, do [docs/supabase-setup.md](docs/supabase-setup.md) first.

### 1. Import the repository

1. Go to <https://vercel.com/new> and import `Whuddahel/bcd-assignment`.
2. Vercel detects Next.js automatically. Leave the build settings alone:
   - Framework: **Next.js**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
3. **Do not deploy yet** — add the environment variables first, or the build will
   fail on env validation.

### 2. Environment variables

In **Project Settings → Environment Variables**, add every variable below for the
**Production**, **Preview**, and **Development** environments.

```bash
NEXT_PUBLIC_APP_URL=https://<your-domain>
DEVELOPMENT_MODE=false
NEXT_PUBLIC_DEVELOPMENT_MODE=false

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=10

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@<your-domain>
```

Three things that bite people here:

- `NEXT_PUBLIC_*` variables are **inlined at build time**. Changing one requires a
  redeploy, not just a restart.
- `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` must never be prefixed with
  `NEXT_PUBLIC_`. That prefix ships them to the browser.
- Preview deployments get a different URL per branch. Either set
  `NEXT_PUBLIC_APP_URL` per-environment, or rely on the callback route's
  `x-forwarded-host` handling, which already resolves the real request origin.

### 3. Point Supabase at the deployed URL

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://<your-domain>`
- **Redirect URLs** — add all of these:
  ```
  https://<your-domain>/auth/callback
  https://<your-domain>/auth/confirm
  https://*-<your-vercel-team>.vercel.app/auth/callback
  http://localhost:3000/auth/callback
  http://localhost:3000/auth/confirm
  ```

Skipping the wildcard entry is the usual reason OAuth works in production but fails
on preview deployments.

### 4. Point Stripe at the deployed URL

Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- URL: `https://<your-domain>/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`,
  `payment_intent.payment_failed`, `charge.refunded`, `account.updated`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

### 5. Verify the deployment

Walk this checklist after the first production deploy:

- [ ] Landing page renders, no dev banner and no role switcher visible
- [ ] Sign up with a real email → verification email arrives → link lands you on `/account`
- [ ] Sign in with `admin@aureon.io` → redirected to `/admin`
- [ ] Signed out, visiting `/admin` redirects to `/`
- [ ] Signed out, visiting `/account` redirects to `/sign-in?next=/account`
- [ ] Google OAuth completes and returns to the app signed in
- [ ] Apple OAuth completes and returns to the app signed in
- [ ] Password reset email arrives and `/reset-password` accepts a new password
- [ ] Browse and product pages show seeded products from Supabase, not mock data
- [ ] `curl https://<your-domain>/api/auth/me` returns `{"user":null}` when signed out

### Rollback

Vercel keeps every previous deployment. **Deployments → ⋯ → Promote to Production**
on the last good build rolls back instantly. Database migrations do **not** roll back
with it — write a new corrective migration rather than editing an applied one.

### Custom domain

**Project Settings → Domains → Add**, then follow Vercel's DNS instructions. Once the
domain resolves, update `NEXT_PUBLIC_APP_URL`, the Supabase Site URL and redirect
list, the Google/Apple OAuth authorised origins, and the Resend sending domain — then
redeploy.

---

## Team

| Area | Owner |
| --- | --- |
| Supabase, auth, deployment | Sidi |
| Customer-facing pages | Lee |
| Stripe, seller + admin dashboards | Mohammed |
| Email, support area, documentation | Edward |

Work happens on per-person branches and merges to `main` via pull request. Commits
follow [Conventional Commits](https://www.conventionalcommits.org/) — `npm run commit`
walks you through the format, and a husky hook rejects anything that does not match.
