"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import { notify, getStaffUserIds } from "@/lib/data/notifications"

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const applySchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(120),
  description: z.string().min(20, "Tell buyers a bit more (min 20 chars)").max(2000),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  // Public Supabase Storage URLs, written by the browser upload in the form.
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
})

export type SellerApplyInput = z.input<typeof applySchema>

/**
 * Create a seller profile for the current user and promote their role to
 * `seller`. The profile starts unverified — an admin verifies it before the
 * seller's listings can go live.
 *
 * Only a `customer` is promoted. `admin` and `support` already reach the seller
 * hub through the route guards, so writing `seller` over their role would
 * silently strip their staff privileges — an admin who applied as a seller
 * would lose /admin.
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
    logo_url: d.logoUrl || null,
    banner_url: d.bannerUrl || null,
  })
  if (error) return { ok: false, error: error.message }

  // Promote to seller so they can reach the seller hub (listings still need
  // admin verification before going live). Staff roles keep theirs.
  if (user.role === "customer") {
    await supabase.from("profiles").update({ role: "seller" }).eq("id", user.id)
  }

  // Put the application in front of whoever can verify it.
  await notify(
    (await getStaffUserIds(["admin"]))
      .filter((id) => id !== user.id)
      .map((id) => ({
        userId: id,
        type: "seller_application" as const,
        title: `New seller application: ${d.businessName}`,
        body: "Review the application and verify the seller to let their listings go live.",
        href: "/admin/sellers",
      })),
  )

  revalidatePath("/", "layout")
  return { ok: true, message: "Application submitted — welcome to Aureon." }
}

/** Update the current user's own seller profile. They must already have one. */
export async function updateSellerProfile(input: SellerApplyInput): Promise<ActionResult> {
  const parsed = applySchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0] ?? "form")] ??= i.message
    return { ok: false, error: "Check the form", fieldErrors }
  }

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "Please sign in." }

  const supabase = await createSupabaseServerClient()
  const d = parsed.data

  const { error, count } = await supabase
    .from("seller_profiles")
    .update({
      business_name: d.businessName,
      description: d.description,
      website_url: d.websiteUrl || null,
      instagram_url: d.instagramUrl || null,
      logo_url: d.logoUrl || null,
      banner_url: d.bannerUrl || null,
    }, { count: "exact" })
    .eq("user_id", user.id)

  if (error) return { ok: false, error: error.message }
  if (!count) return { ok: false, error: "No seller profile found for your account." }

  revalidatePath("/seller/apply")
  revalidatePath("/sellers", "layout")
  return { ok: true, message: "Business profile updated." }
}
