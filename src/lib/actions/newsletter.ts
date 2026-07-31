"use server"

import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type NewsletterResult = { ok: true; message: string } | { ok: false; error: string }

const schema = z.object({ email: z.email("Enter a valid email address") })

/** Public newsletter opt-in — RLS allows anonymous inserts. */
export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const parsed = schema.safeParse({ email })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email })

  // A duplicate email is a success from the user's perspective.
  if (error && !/duplicate|unique/i.test(error.message)) {
    return { ok: false, error: error.message }
  }

  return { ok: true, message: "You're on the list — welcome to Aureon." }
}
