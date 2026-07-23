import { env } from "./env"

export const hasSupabase = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export const hasStripe = Boolean(
  env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY,
)

export const hasResend = Boolean(env.RESEND_API_KEY)

/**
 * True when the app is running against mocks for at least one service.
 * Drives the dev banner and the role switcher.
 */
export const isDevelopmentMode =
  env.NEXT_PUBLIC_DEVELOPMENT_MODE || env.DEVELOPMENT_MODE || !hasSupabase

/**
 * Auth specifically falls back to a fake session only when Supabase is not
 * configured at all. Once real keys are present, auth is real even if the rest
 * of the app (Stripe, Resend) is still mocked — so the team can keep working
 * on their slices while auth is live.
 */
export const useMockAuth = !hasSupabase

// True when server-side code should read/write real Supabase rows instead of
// the static mock catalog. Kept as a single source of truth so price
// resolution (checkout) and persistence (webhook) never disagree about which
// product ids are valid.
export const useLiveData = hasSupabase && !isDevelopmentMode

export const appConfig = {
  name: "Aureon",
  tagline: "Own the Rare",
  description:
    "Curated luxury watches, art, and rare collectibles — with provenance you can trust.",
  url: env.NEXT_PUBLIC_APP_URL,
  isDev: isDevelopmentMode,
  stripe: {
    platformFeePercent: env.STRIPE_PLATFORM_FEE_PERCENT,
  },
  email: {
    from: env.RESEND_FROM_EMAIL,
  },
} as const

/** Where each role lands after signing in. */
export const ROLE_HOME: Record<string, string> = {
  customer: "/account",
  seller: "/seller",
  admin: "/admin",
  support: "/support",
}
