"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const applySchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(120),
  description: z.string().min(20, "Tell buyers a bit more (min 20 chars)").max(2000),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

export type SellerApplyInput = z.input<typeof applySchema>

/**
 * Create a seller profile for the current user and promote their role to
 * `seller`. The profile starts unverified — an admin verifies it before the
 * seller's listings can go live.
 */
export async function applyAsSeller(input: SellerApplyInput): Promise<ActionResult> {
  const parsed = applySchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message
    return { ok: false, error: "Check the form", fieldErrors }
  }

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "Please sign in to apply." }

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return { ok: false, error: "You already have a seller profile." }

  const d = parsed.data
  const { error } = await supabase.from("seller_profiles").insert({
    user_id: user.id,
    business_name: d.businessName,
    description: d.description,
    website_url: d.websiteUrl || null,
    instagram_url: d.instagramUrl || null,
  })
  if (error) return { ok: false, error: error.message }

  // Promote to seller so they can reach the seller hub (listings still need
  // admin verification before going live).
  await supabase.from("profiles").update({ role: "seller" }).eq("id", user.id)

  revalidatePath("/", "layout")
  return { ok: true, message: "Application submitted — welcome to Aureon." }
}
