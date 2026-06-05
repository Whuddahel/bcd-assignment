import { z } from "zod"

const envSchema = z.object({
  // ── App ──
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DEVELOPMENT_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(true),

  // ── Supabase ──
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // ── Stripe ──
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PLATFORM_FEE_PERCENT: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .default(10),

  // ── Resend ──
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z
    .string()
    .email()
    .default("noreply@aureon.io"),

  // ── Google OAuth (configured via Supabase) ──
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Apple OAuth (configured via Supabase) ──
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
})

function parseEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n")
    throw new Error(`❌ Invalid environment variables:\n${issues}`)
  }

  return result.data
}

export const env = parseEnv()

export type Env = z.infer<typeof envSchema>
