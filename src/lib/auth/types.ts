import type { UserRole } from "@/types/database"

/**
 * Shared shape for the signed-in user. Lives apart from session.ts so client
 * components can import it without dragging in `next/headers`.
 */
export type SessionUser = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  avatarUrl: string | null
  role: UserRole
  /** True when this session came from the dev fallback, not Supabase. */
  isMock: boolean
}

/** Stand-in session used when Supabase is not configured. Mirrors seed.sql. */
export const MOCK_SESSION_USER: SessionUser = {
  // Matches buyer1@aureon.io in seed.sql, so mock-mode IDs line up with the
  // seeded data the rest of the team develops against.
  id: "00000000-0000-0000-0000-000000000031",
  email: "buyer1@aureon.io",
  fullName: "Emma Wilson",
  phone: null,
  avatarUrl: null,
  role: "customer",
  isMock: true,
}

/** Initials for the avatar bubble. */
export function initialsOf(user: Pick<SessionUser, "fullName" | "email">) {
  const source = user.fullName?.trim() || user.email
  if (!source) return "?"

  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase()
}
