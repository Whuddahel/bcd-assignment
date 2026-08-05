import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component — cookies are read-only here.
          // The session will still refresh via middleware.
        }
      },
    },
  })
}

/**
 * True service-role client — no session, no cookies. Deliberately NOT built on
 * `@supabase/ssr`'s createServerClient: that factory is designed to read and
 * act as the caller's own signed-in session whenever cookies are present, which
 * silently defeats the service-role key's RLS bypass for any authenticated
 * request (it only ever looked like it worked here because every caller so far
 * happened to already satisfy the relevant policy as themselves). Plain
 * supabase-js has no cookie/session concept at all, so this always authenticates
 * purely as the service role, regardless of who's signed in.
 */
export async function createSupabaseServerAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
