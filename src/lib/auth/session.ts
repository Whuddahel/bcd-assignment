import { cache } from "react"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ROLE_HOME, useMockAuth } from "@/lib/config"
import { MOCK_SESSION_USER, type SessionUser } from "@/lib/auth/types"
import type { UserRole } from "@/types/database"

export type { SessionUser }
export { MOCK_SESSION_USER }

/**
 * The signed-in user plus their profile role, or null.
 *
 * `cache` dedupes this across a single render pass, so layouts and pages can
 * each call it without stacking up round trips.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (useMockAuth) return MOCK_SESSION_USER

  const supabase = await createSupabaseServerClient()

  // getUser() revalidates the JWT with Supabase — never trust getSession()
  // on the server, its payload comes straight from the cookie.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name, phone, avatar_url")
    .eq("id", user.id)
    .single()

  // A failed profile lookup silently falling back to "customer" below is how
  // a real seller/admin/support user ends up looking bounced to a default
  // account — log it loudly so a transient DB/network hiccup is diagnosable
  // instead of looking like a permanent role change.
  if (profileError) {
    console.error("getSessionUser: profile lookup failed for", user.id, profileError)
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? null,
    phone: profile?.phone ?? null,
    avatarUrl: profile?.avatar_url ?? (user.user_metadata?.avatar_url as string) ?? null,
    role: profile?.role ?? "customer",
    isMock: false,
  }
})

/**
 * Guard for server components. Redirects to sign-in when signed out, or to the
 * user's own home when they lack the required role.
 *
 * Middleware already blocks these routes; this is the second line of defence
 * for anything rendered outside a guarded path.
 */
export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser()

  if (!user) redirect("/sign-in")
  if (roles && !roles.includes(user.role)) redirect(ROLE_HOME[user.role] ?? "/")

  return user
}
