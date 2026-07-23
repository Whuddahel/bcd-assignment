"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { MOCK_SESSION_USER, type SessionUser } from "@/lib/auth/types"
import { useMockAuth } from "@/lib/config"
import { useDevStore } from "@/stores/dev-store"

async function fetchSessionUser(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" })
  if (!res.ok) return null
  const json = (await res.json()) as { user: SessionUser | null }
  return json.user
}

/**
 * The signed-in user, for client components.
 *
 * Without Supabase configured this returns a fake session whose role follows
 * the dev role switcher, so the rest of the team can keep building
 * role-specific UI with no credentials.
 */
export function useUser() {
  const queryClient = useQueryClient()
  const mockRole = useDevStore((s) => s.mockRole)

  const query = useQuery({
    queryKey: ["session-user"],
    queryFn: fetchSessionUser,
    enabled: !useMockAuth,
    staleTime: 30_000,
  })

  // Keep the cache in step with token refreshes and sign-outs in other tabs.
  useEffect(() => {
    if (useMockAuth) return

    const supabase = createSupabaseBrowserClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["session-user"] })
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  if (useMockAuth) {
    return {
      user: { ...MOCK_SESSION_USER, role: mockRole } satisfies SessionUser,
      isLoading: false,
      isMock: true,
    }
  }

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isMock: false,
  }
}
