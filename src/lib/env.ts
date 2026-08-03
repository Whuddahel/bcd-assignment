import { z } from "zod"

/**
 * Booleans arrive from the environment as strings. Defaults are applied to the
 * raw string *before* the transform so the parsed type is always a boolean.
 */
const boolFromString = (fallback: "true" | "false") =>
  z
    .string()
    .optional()
    .default(fallback)
    .transform((v) => v === "true" || v === "1")

const envSchema = z.object({
  // ── App ──
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

  // Server-side flag. Kept for scripts and server-only checks.
  DEVELOPMENT_MODE: boolFromString("true"),

  // Client-visible mirror of the flag — `DEVELOPMENT_MODE` is not inlined into
  // the browser bundle, so without this the client and server would disagree
  // about which mode the app is in. Keep both values in sync in .env.local.
  NEXT_PUBLIC_DEVELOPMENT_MODE: boolFromString("true"),

  // ── Supabase ──
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // ── Stripe ──
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PLATFORM_FEE_PERCENT: z
    .string()
    .optional()
    .default("10")
    .transform((v) => Number(v))
    .pipe(z.number().min(0).max(100)),

  // ── Resend ──
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.email().default("noreply@aureon.io"),

  // ── Google OAuth (configured via Supabase) ──
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Apple OAuth (configured via Supabase) ──
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),

  // ── Blockchain (Phase 2 — local Hardhat node) ──
  // Client-visible RPC endpoint the browser reads provenance from.
  NEXT_PUBLIC_BLOCKCHAIN_RPC_URL: z.string().default("http://127.0.0.1:8545"),
  NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID: z
    .string()
    .optional()
    .default("31337")
    .transform((v) => Number(v))
    .pipe(z.number().int().positive()),
  // Server-only signer for platform actions (mint/attest/transfer). Defaults to
  // Hardhat's well-known account #0 key — LOCAL DEV ONLY, never a real key.
  BLOCKCHAIN_OPERATOR_KEY: z
    .string()
    .default("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
})

function parseEnv() {
  /**
   * Next.js only inlines `process.env.X` when X is written out literally, so
   * the public vars are listed explicitly here. Server-only vars are read from
   * `process.env` directly and resolve to undefined in the browser bundle,
   * which is exactly what we want.
   */
  const raw = {
    ...process.env,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEVELOPMENT_MODE: process.env.NEXT_PUBLIC_DEVELOPMENT_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BLOCKCHAIN_RPC_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL,
    NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID: process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID,
  }

  const result = envSchema.safeParse(raw)

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
