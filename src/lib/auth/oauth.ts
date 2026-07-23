"use client"

import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { hasSupabase } from "@/lib/config"

export type OAuthProvider = "google" | "apple"

/**
 * Starts the OAuth dance from the browser.
 *
 * It has to run client-side: the PKCE verifier is generated here and stored in
 * a cookie that /auth/callback reads back when it exchanges the code.
 */
export async function signInWithOAuth(provider: OAuthProvider, next?: string) {
  if (!hasSupabase) {
    throw new Error(
      "Supabase is not configured — add your project URL and anon key to .env.local.",
    )
  }

  const supabase = createSupabaseBrowserClient()
  const callback = new URL("/auth/callback", window.location.origin)
  if (next) callback.searchParams.set("next", next)

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callback.toString(),
      queryParams:
        provider === "google"
          ? { access_type: "offline", prompt: "consent" }
          : undefined,
    },
  })

  if (error) throw error
}
