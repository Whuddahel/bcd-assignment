import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"

type RouteGuard = {
  pattern: RegExp
  roles: string[]
}

const ROUTE_GUARDS: RouteGuard[] = [
  { pattern: /^\/account/, roles: ["customer", "seller", "admin", "support"] },
  { pattern: /^\/seller/, roles: ["seller", "admin"] },
  { pattern: /^\/admin/, roles: ["admin"] },
  { pattern: /^\/support/, roles: ["support", "admin"] },
]

/** Where to send a signed-in user who lacks the role for the route. */
const ROLE_HOME: Record<string, string> = {
  customer: "/account",
  seller: "/seller",
  admin: "/admin",
  support: "/support",
}

/** Never guarded — these are how a signed-out user gets a session. */
const PUBLIC_AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  // No Supabase configured: auth is mocked, so every route is open. This is
  // what lets the rest of the team run the app with no credentials.
  if (!hasSupabase) return NextResponse.next()

  const response = NextResponse.next({ request })

  const supabase = createSupabaseMiddlewareClient(request, response)
  if (!supabase) return response

  // Refresh the session — do NOT remove, required for cookie-based auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) return response

  const guard = ROUTE_GUARDS.find((g) => g.pattern.test(pathname))
  if (!guard) return response

  // Not signed in — send to sign-in and come back here afterwards.
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/sign-in"
    loginUrl.search = ""
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify the user's role against the guard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // Signed in but wrong role — bounce to their own home rather than sign-in,
  // which would be nonsense for someone who already has a session.
  if (!profile || !guard.roles.includes(profile.role)) {
    const home = profile ? (ROLE_HOME[profile.role] ?? "/") : "/"
    return NextResponse.redirect(new URL(home, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
