# Supabase setup runbook

Everything needed to take Aureon from mock data to a real Supabase backend, with
Google and Apple sign-in working. Follow it top to bottom; each step says what
"working" looks like so you can catch a mistake before it compounds.

**Time:** ~30 minutes for Supabase + Google. Apple adds ~45 minutes and needs a paid
Apple Developer account.

---

## Contents

1. [Install the CLI](#1-install-the-cli)
2. [Validate locally first](#2-validate-locally-first-optional-but-worth-it)
3. [Create the hosted project](#3-create-the-hosted-project)
4. [Run the migration](#4-run-the-migration)
5. [Run the seed](#5-run-the-seed)
6. [Wire the app](#6-wire-the-app)
7. [Auth URL configuration](#7-auth-url-configuration)
8. [Google OAuth](#8-google-oauth)
9. [Apple OAuth](#9-apple-oauth)
10. [Email templates](#10-email-templates)
11. [Final verification](#11-final-verification)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Install the CLI

```bash
brew install supabase/tap/supabase
supabase --version
supabase login          # opens a browser to authorise the CLI
```

The CLI is optional — everything can be done through the dashboard SQL editor — but
it makes migrations reproducible, which matters once four people are pushing schema
changes.

---

## 2. Validate locally first (optional, but worth it)

Catching a broken migration on your laptop is much cheaper than catching it in the
hosted project. Requires Docker Desktop running.

```bash
cd bcd-assignment
supabase start          # first run pulls images, takes a few minutes
supabase db reset       # applies migrations, then seed.sql
```

Expected output ends with `Finished supabase db reset.` and no `ERROR:` lines.

You now have:

| Service | URL |
| --- | --- |
| API | http://127.0.0.1:54321 |
| Studio (table browser) | http://127.0.0.1:54323 |
| Inbucket (catches all outbound email) | http://127.0.0.1:54324 |

Point `.env.local` at the local stack using the keys `supabase start` printed:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from the CLI output>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from the CLI output>
```

Run `npm run dev` and sign in as `admin@aureon.io` / `test1234!`. If that works
locally, the hosted setup is mostly copy-paste.

Stop it with `supabase stop` when you are done.

---

## 3. Create the hosted project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Name: `aureon`.
3. **Database password**: generate a strong one and save it in the team password
   manager immediately. It cannot be recovered, only reset.
4. Region: pick the one closest to your users (`eu-west-2` for the UK).
5. Plan: Free is fine for the assignment.

Provisioning takes 2–3 minutes.

Then grab the credentials from **Project Settings → API**:

| Dashboard field | Environment variable |
| --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

> The `service_role` key bypasses every RLS policy. It belongs only in server-side
> environment variables — never in a `NEXT_PUBLIC_*` name, never in client code,
> never in a commit. If it leaks, rotate it in Project Settings → API immediately.

---

## 4. Run the migration

### Option A — CLI (preferred)

The project ref is the subdomain in your project URL:
`https://abcdefghijklmnop.supabase.co` → `abcdefghijklmnop`.

```bash
supabase link --project-ref <project-ref>   # prompts for the database password
supabase db push
```

### Option B — dashboard

Open **SQL Editor → New query**, paste the entire contents of
`supabase/migrations/20240101000000_initial_schema.sql`, and run it.

### Verify

**Table Editor** should list 14 tables: `profiles`, `seller_profiles`, `categories`,
`products`, `product_images`, `orders`, `order_items`, `reviews`, `wishlist_items`,
`cart_items`, `support_tickets`, `support_messages`, `notifications`,
`newsletter_subscribers`.

Then confirm RLS is actually on — an unprotected table is the single most likely
security mistake here:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Every row must show `rowsecurity = true`. If any is false, the migration did not
finish; re-run it.

---

## 5. Run the seed

**SQL Editor → New query**, paste all of `supabase/seed.sql`, run.

The seed writes directly into `auth.users` and sets
`session_replication_role = replica` to bypass foreign keys while doing so. That is
fine for the SQL editor and the local CLI, but it means the seed **cannot** be run
through a normal client library.

### Verify

```sql
SELECT
  (SELECT count(*) FROM auth.users)             AS users,
  (SELECT count(*) FROM public.profiles)        AS profiles,
  (SELECT count(*) FROM public.seller_profiles) AS sellers,
  (SELECT count(*) FROM public.categories)      AS categories,
  (SELECT count(*) FROM public.products)        AS products;
```

Expect roughly: 20 users, 20 profiles, 10 sellers, 6 categories, 50 products.

If `profiles` is double the user count, the seed ran twice **and** the
`handle_new_user` trigger also fired. Reset with `supabase db reset` locally, or drop
and recreate the hosted project — do not try to hand-patch it.

---

## 6. Wire the app

In `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEVELOPMENT_MODE=true
NEXT_PUBLIC_DEVELOPMENT_MODE=true

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Leaving `DEVELOPMENT_MODE=true` is intentional: auth goes real as soon as the
Supabase keys exist, while Stripe and email stay mocked so nobody else is blocked.

Restart the dev server — env changes are not hot-reloaded.

### Verify

```bash
curl -s http://localhost:3000/api/auth/me
# {"user":null}   ← real auth is live and you are signed out
```

If it still returns Emma Wilson with `"isMock":true`, the keys are not being read.
Check the file is named `.env.local` (not `.env.example`) and restart.

Now sign in at <http://localhost:3000/sign-in> with `admin@aureon.io` / `test1234!`.
You should land on `/admin`.

To confirm the guards actually bite, sign out and sign back in as
`buyer1@aureon.io` / `test1234!`, then visit `/admin` — a customer should be
redirected to `/`.

---

## 7. Auth URL configuration

**Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for now; change to the Vercel domain at
  deploy time.
- **Redirect URLs**:
  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/auth/confirm
  ```

Add the production and preview URLs when you deploy (see the README's deployment
section).

While you are here, **Authentication → Providers → Email**: keep **Confirm email**
enabled. It costs one extra click during testing and is the correct production
behaviour.

---

## 8. Google OAuth

### 8a. Google Cloud Console

1. <https://console.cloud.google.com> → create a project named `Aureon`.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - App name: `Aureon`, support email, developer contact
   - Scopes: `email`, `profile`, `openid` are enough — do not request more
   - Add your own Google account under **Test users** while the app is unpublished
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Aureon Web`
   - **Authorised JavaScript origins**:
     ```
     http://localhost:3000
     https://<your-vercel-domain>
     ```
   - **Authorised redirect URIs** — this must be the *Supabase* callback, not the
     app's:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
4. Copy the **Client ID** and **Client secret**.

The single most common mistake is putting `http://localhost:3000/auth/callback` in
the redirect URIs. Google redirects to Supabase; Supabase then redirects to the app.

### 8b. Supabase

**Authentication → Providers → Google** → enable, paste the Client ID and Client
Secret, save.

### 8c. Verify

Sign out, click **Continue with Google** on `/sign-in`. You should complete the
Google flow and land on `/account` signed in. Check **Authentication → Users** in
Supabase — your Google account should appear, and `public.profiles` should have a
matching row created by the `handle_new_user` trigger.

---

## 9. Apple OAuth

Apple requires a **paid Apple Developer Program membership** ($99/yr). If the team
does not have one, skip this and note it as a known limitation — everything else
works without it.

### 9a. Apple Developer portal

1. <https://developer.apple.com/account> → **Certificates, Identifiers & Profiles**.
2. **Identifiers → +  → App IDs → App**:
   - Description: `Aureon`
   - Bundle ID: `com.<yourcompany>.aureon`
   - Enable **Sign in with Apple**
3. **Identifiers → + → Services IDs**:
   - Description: `Aureon Web`
   - Identifier: `com.<yourcompany>.aureon.web` — **this is your client ID**
   - Enable **Sign in with Apple** → **Configure**:
     - Primary App ID: the App ID from step 2
     - Domains: `<project-ref>.supabase.co`
     - Return URLs: `https://<project-ref>.supabase.co/auth/v1/callback`
4. **Keys → +**:
   - Name: `Aureon Sign In`
   - Enable **Sign in with Apple**, configure it against the App ID
   - Register, then **download the `.p8` file**. Apple lets you download it exactly
     once — store it in the team password manager straight away.
   - Note the **Key ID** and, from the top-right of the portal, your **Team ID**.

### 9b. Supabase

Apple's "secret" is a JWT you generate from the `.p8` key, not the key itself. The
Supabase dashboard will generate it for you: **Authentication → Providers → Apple** →
enable, then supply:

| Field | Value |
| --- | --- |
| Client ID | the **Services ID** (`com.<yourcompany>.aureon.web`) |
| Team ID | from the developer portal |
| Key ID | from the key you created |
| Private key | the full contents of the `.p8` file, including the BEGIN/END lines |

Save.

### 9c. Verify

Click **Continue with Apple** on `/sign-in`.

Note that Apple returns the user's name **only on the very first authorisation**.
After that it sends the email alone, so `full_name` will be null for returning users
who first signed in before this was set up. If you need to re-test the first-time
flow, revoke the app at <https://appleid.apple.com> → Sign in with Apple.

Users who choose **Hide My Email** arrive with a `@privaterelay.appleid.com` address.
That is expected and works fine — just be aware transactional email to those
addresses routes through Apple's relay, which Edward will need to know about.

---

## 10. Email templates

The local stack already uses our templates — they live in
[`supabase/templates/`](../supabase/templates/) and are wired up by `config.toml`.
**The hosted project does not read those files**, so the same two templates have to
be pasted into the dashboard by hand.

> The Supabase defaults are not merely uglier, they are **broken for this app**. The
> default link goes to GoTrue's `/auth/v1/verify`, which returns the session in a URL
> *fragment* — and fragments are never sent to the server, so our route handler
> cannot see the token. A password reset with the default template drops the user on
> the homepage with no way to set a password. Use `.TokenHash`, not
> `.ConfirmationURL`.

**Authentication → Email Templates**, and set both:

For **Confirm signup**:

```html
<h2>Confirm your Aureon account</h2>
<p>Welcome to Aureon. Click below to activate your account:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account">
    Confirm my account
  </a>
</p>
```

For **Reset password**:

```html
<h2>Reset your Aureon password</h2>
<p>Click below to choose a new password. This link expires in one hour.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
    Reset my password
  </a>
</p>
```

The `next=` parameter is what sends a recovery link to `/reset-password` instead of
dumping the user on the account page with no idea what to do.

> Supabase's built-in SMTP is rate-limited to a handful of emails per hour and is not
> meant for production. Edward's Resend integration replaces it — at that point set
> the custom SMTP credentials under **Project Settings → Authentication → SMTP**.

---

## 11. Final verification

Run through this before calling the setup done:

- [ ] All 14 tables exist and every one reports `rowsecurity = true`
- [ ] Seed counts match (20 users / 10 sellers / 50 products)
- [ ] `curl localhost:3000/api/auth/me` returns `{"user":null}` when signed out
- [ ] Email + password sign-in works for a seeded account
- [ ] A brand-new sign-up sends a verification email, and the link signs you in
- [ ] `handle_new_user` created a `profiles` row for that new user
- [ ] Password reset email arrives and `/reset-password` accepts a new password
- [ ] Google sign-in completes end to end
- [ ] Apple sign-in completes end to end (or is documented as skipped)
- [ ] `admin@aureon.io` lands on `/admin`; `buyer1@aureon.io` is redirected away from it
- [ ] Signed out, `/account` redirects to `/sign-in?next=/account`
- [ ] Sign out clears the session and returns you to `/sign-in`

---

## 12. Troubleshooting

**`redirect_uri_mismatch` from Google**
The redirect URI in Google Cloud must be the Supabase callback
(`https://<project-ref>.supabase.co/auth/v1/callback`), not an app URL. It must match
character for character, including the scheme and any trailing slash.

**OAuth returns to `/sign-in?error=...`**
The URL the provider sent the browser back to is not in Supabase's **Redirect URLs**
allow-list. Add the exact origin, including port for localhost.

**"Invalid login credentials" for a seeded account**
Either the seed did not run, or email confirmation is on and the seeded
`email_confirmed_at` did not stick. Check:
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@aureon.io';
```
If `email_confirmed_at` is null, set it:
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
```

**Signed in, but queries return empty arrays**
RLS is doing its job and the policy does not match. Check the user's role:
```sql
SELECT id, role FROM public.profiles WHERE id = '<user-id>';
```
Remember that `products` only exposes rows with `status = 'active'` to ordinary
users — a seller's own drafts are visible to that seller alone.

**Session vanishes on refresh**
Middleware is not refreshing the cookie. Confirm `src/middleware.ts` still calls
`supabase.auth.getUser()` and that its `matcher` covers the route. That call looks
redundant but is what rotates the auth cookie.

**`Invalid environment variables` on boot**
`src/lib/env.ts` validation failed. The error names the offending variable. Usually
it is a `NEXT_PUBLIC_SUPABASE_URL` that is missing the `https://` scheme.

**Changed a `NEXT_PUBLIC_*` value and nothing happened**
Those are inlined at build time. Restart the dev server locally; redeploy on Vercel.

**Edited `config.toml` and the change had no effect**
`supabase start` is a no-op when the containers are already running — it will not
re-apply configuration. Run `supabase stop && supabase start`. Verify a setting
really landed by reading the container's environment, e.g.:
```bash
docker exec supabase_auth_aureon env | grep TEMPLATE
```

**Email links point at the wrong port**
The links are built from `site_url` in `config.toml` (port 3000). If something else
already holds 3000, `next dev` quietly falls back to 3001 and the emailed links go to
the wrong app. Free port 3000 before starting the dev server, or change `site_url`
locally to match.

**`supabase db reset` says "supabase start is not running"**
The local stack is not up. Start Docker Desktop, then `supabase start`.

**Docker will not start after the disk filled**
A full disk kills the VM engine and leaves `com.docker.backend` wedged in a failed
recovery loop, so relaunching the app just re-attaches to the broken process. Free
space, then `pkill -9 -f com.docker.backend` before reopening Docker Desktop.
