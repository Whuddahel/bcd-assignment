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
- [Development mode vs. real services](#development-mode-vs-real-services)
- [Database](#database)
- [Authentication](#authentication)
- [Project structure](#project-structure)
- [Deployment](#deployment)

---

## Quick start

```bash
git clone https://github.com/Whuddahel/bcd-assignment.git
cd bcd-assignment
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. With no credentials in `.env.local` the app runs
entirely on mock data — every page renders, and a role switcher in the bottom-right
corner lets you view the app as a customer, seller, admin, or support agent.

To run against a real Supabase project, follow
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
| `DEVELOPMENT_MODE` | Always | Server-side mock switch. |
| `NEXT_PUBLIC_DEVELOPMENT_MODE` | Always | Client-visible mirror — **keep identical** to the above. |
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

## Development mode vs. real services

The app is designed so each external service can be switched on independently — no
one is blocked waiting on someone else's integration.

`DEVELOPMENT_MODE=true` keeps Stripe mocked and emails console-logged, and shows the
dev banner plus role switcher.

**Auth is the exception.** It switches to real Supabase the moment
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present,
regardless of `DEVELOPMENT_MODE`. This is deliberate: auth can go live while Stripe
and email are still mocked.

| Supabase keys | Behaviour |
| --- | --- |
| Absent | Mock customer session, role follows the dev switcher, **every route is open** |
| Present | Real sign-in/sign-up/OAuth, real sessions, middleware enforces role guards |

The flags live in [`src/lib/config.ts`](src/lib/config.ts) as `isDevelopmentMode`,
`useMockAuth`, `hasSupabase`, `hasStripe`, and `hasResend`.

> The open-routes behaviour is a **development convenience only**. It is safe
> because it cannot trigger in production: a deployment without Supabase keys has no
> data to protect. Never deploy with the keys missing.

---

## Database

Schema and seed data live in [`supabase/`](supabase/).

- `migrations/20240101000000_initial_schema.sql` — 14 tables, enums, indexes
  (including a full-text index on products), triggers, and Row Level Security
  policies for all four roles.
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
│   └── dev/             dev-mode banner and role switcher
├── lib/
│   ├── auth/            actions, session, schemas, OAuth, shared types
│   ├── supabase/        browser, server, and middleware clients
│   ├── mock/            mock data mirroring the seed
│   ├── config.ts        feature flags derived from env
│   └── env.ts           validated environment (zod)
├── stores/              zustand — cart, notifications, dev role
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
