import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { hasSupabase } from "@/lib/config"

/**
 * Handles Supabase email links that carry a `token_hash` — signup
 * confirmations, magic links, email changes, and password recovery.
 *
 * Recovery links land here first so the user arrives at /reset-password
 * already inside a valid session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/account"

  const forwardedHost = request.headers.get("x-forwarded-host")
  const baseUrl =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`

  const fail = (message: string) =>
    NextResponse.redirect(
      `${baseUrl}/sign-in?error=${encodeURIComponent(message)}`,
    )

  if (!hasSupabase) return fail("Supabase is not configured")
  if (!tokenHash || !type) return fail("This link is invalid or incomplete")

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) return fail("This link has expired or was already used")

  const safeNext = next.startsWith("/") ? next : "/account"
  return NextResponse.redirect(`${baseUrl}${safeNext}`)
}
