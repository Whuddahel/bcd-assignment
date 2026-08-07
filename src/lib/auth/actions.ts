"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ROLE_HOME, useMockAuth } from "@/lib/config"
import { env } from "@/lib/env"
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/schemas"

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const MOCK_NOTICE =
  "Supabase is not configured — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."

/** Absolute origin for email + OAuth redirect links, proxy-aware on Vercel. */
async function getOrigin(): Promise<string> {
  const h = await headers()
  const forwardedHost = h.get("x-forwarded-host")
  const forwardedProto = h.get("x-forwarded-proto") ?? "https"

  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return env.NEXT_PUBLIC_APP_URL
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    fieldErrors[key] ??= issue.message
  }
  return fieldErrors
}

// ── Email + password ────────────────────────────────────────────────────────

export async function signInWithPassword(
  input: { email: string; password: string },
  next?: string,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Check the form", fieldErrors: flatten(parsed.error) }
  }

  if (useMockAuth) return { ok: false, error: MOCK_NOTICE }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    // Supabase deliberately returns the same message for unknown email and bad
    // password — do not try to distinguish them, that leaks account existence.
    return { ok: false, error: error.message }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (profileError) {
    // Landing a real seller/admin/support user on /account because this read
    // hiccuped is the exact "dumped on a default account" bug — log it loudly.
    console.error("signInWithPassword: profile lookup failed for", data.user.id, profileError)
  }

  revalidatePath("/", "layout")
  redirect(next || ROLE_HOME[profile?.role ?? "customer"] || "/account")
}

export async function signUpWithPassword(input: {
  fullName: string
  email: string
  password: string
}): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Check the form", fieldErrors: flatten(parsed.error) }
  }

  if (useMockAuth) return { ok: false, error: MOCK_NOTICE }

  const supabase = await createSupabaseServerClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // handle_new_user() copies full_name into public.profiles on insert.
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  })

  if (error) return { ok: false, error: error.message }

  return { ok: true, message: "Check your email to confirm your account." }
}

export async function signOut(): Promise<void> {
  if (!useMockAuth) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  }

  revalidatePath("/", "layout")
  redirect("/sign-in")
}

// ── Password reset ──────────────────────────────────────────────────────────

export async function requestPasswordReset(input: {
  email: string
}): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Check the form", fieldErrors: flatten(parsed.error) }
  }

  if (useMockAuth) return { ok: false, error: MOCK_NOTICE }

  const supabase = await createSupabaseServerClient()
  const origin = await getOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })

  // Report success either way — a differing response would confirm which
  // addresses have accounts.
  if (error && !error.message.toLowerCase().includes("not found")) {
    return { ok: false, error: error.message }
  }

  return { ok: true, message: "If that email has an account, a reset link is on its way." }
}

/** Called from /reset-password, which runs inside the recovery session. */
export async function updatePassword(input: {
  password: string
  confirmPassword: string
}): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Check the form", fieldErrors: flatten(parsed.error) }
  }

  if (useMockAuth) return { ok: false, error: MOCK_NOTICE }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/", "layout")
  return { ok: true, message: "Password updated." }
}
