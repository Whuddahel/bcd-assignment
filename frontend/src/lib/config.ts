import { env } from "./env"

export const isDevelopmentMode =
  env.DEVELOPMENT_MODE ||
  (!env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const hasSupabase = Boolean(
  env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export const hasStripe = Boolean(
  env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY,
)

export const hasResend = Boolean(env.RESEND_API_KEY)

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
