import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ROLE_HOME, hasSupabase } from "@/lib/config"

/**
 * OAuth + email-confirmation landing point.
 *
 * Supabase sends the browser here with a one-time `code`, which we swap for a
 * session cookie. Everything Google/Apple related funnels through this route.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get("code")
  const next = searchParams.get("next")
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error")

  // Behind a proxy (Vercel) `origin` is the internal host — prefer the
  // forwarded one so redirects land on the public domain.
  const forwardedHost = request.headers.get("x-forwarded-host")
  const baseUrl =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`

  const fail = (message: string) =>
    NextResponse.redirect(
      `${baseUrl}/sign-in?error=${encodeURIComponent(message)}`,
    )

  if (oauthError) return fail(oauthError)
  if (!hasSupabase) return fail("Supabase is not configured")
  if (!code) return fail("Missing authorization code")

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) return fail(error.message)

  if (next?.startsWith("/")) {
    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  return NextResponse.redirect(
    `${baseUrl}${ROLE_HOME[profile?.role ?? "customer"] ?? "/account"}`,
  )
}
