import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware"

type RouteGuard = {
  pattern: RegExp
  roles: string[]
  redirect: string
}

const ROUTE_GUARDS: RouteGuard[] = [
  {
    pattern: /^\/account/,
    roles: ["customer", "seller", "admin", "support"],
    redirect: "/sign-in",
  },
  { pattern: /^\/seller/, roles: ["seller", "admin"], redirect: "/sign-in" },
  { pattern: /^\/admin/, roles: ["admin"], redirect: "/" },
  { pattern: /^\/support/, roles: ["support", "admin"], redirect: "/" },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDevMode =
    process.env.DEVELOPMENT_MODE === "true" || process.env.DEVELOPMENT_MODE === "1"
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  // Dev mode without Supabase: let all requests through
  if (isDevMode && !hasSupabase) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })

  if (!hasSupabase) return response

  const supabase = createSupabaseMiddlewareClient(request, response)
  if (!supabase) return response

  // Refresh the session — do NOT remove, required for cookie-based auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const guard = ROUTE_GUARDS.find((g) => g.pattern.test(pathname))
  if (!guard) return response

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = guard.redirect
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify the user's role against the guard
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !guard.roles.includes(profile.role)) {
    return NextResponse.redirect(new URL(guard.redirect, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
