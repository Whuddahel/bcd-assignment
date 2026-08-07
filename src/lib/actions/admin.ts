"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import { notify, getSellerOwnerIds } from "@/lib/data/notifications"
import type { ProductStatus } from "@/types/database"

export type AdminResult = { ok: true; message?: string } | { ok: false; error: string }

async function requireAdmin(): Promise<boolean> {
  const user = await getSessionUser()
  return Boolean(user && user.role === "admin")
}

/** Approve (→ active), reject (→ archived), or otherwise moderate any product. */
export async function adminSetProductStatus(
  productId: string,
  status: ProductStatus,
): Promise<AdminResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." }

  const admin = await createSupabaseServerAdminClient()
  const { data: product, error } = await admin
    .from("products")
    .update({ status })
    .eq("id", productId)
    .select("id, title, slug, seller_id")
    .maybeSingle()
  if (error) return { ok: false, error: error.message }

  // Tell the seller what happened to their listing.
  if (product && (status === "active" || status === "archived")) {
    const owners = await getSellerOwnerIds([product.seller_id])
    const ownerId = owners.get(product.seller_id)
    if (ownerId) {
      const approved = status === "active"
      await notify({
        userId: ownerId,
        type: approved ? "listing_approved" : "listing_rejected",
        title: approved ? `"${product.title}" is live` : `"${product.title}" was archived`,
        body: approved
          ? "Your listing passed review and is now visible to buyers."
          : "An admin took this listing off the marketplace. Contact support if you think it's a mistake.",
        href: approved ? `/product/${product.slug}` : "/seller/products",
      })
    }
  }

  revalidatePath("/admin/products")
  revalidatePath("/browse")
  return { ok: true, message: `Product ${status === "active" ? "approved" : status}.` }
}

/**
 * Suspend or reinstate a user via GoTrue's ban mechanism (no schema change).
 * A banned user cannot obtain a session.
 */
export async function adminSetUserBanned(
  userId: string,
  banned: boolean,
): Promise<AdminResult> {
  const actor = await getSessionUser()
  if (!actor || actor.role !== "admin") return { ok: false, error: "Not authorized." }

  // The client already disables this for admin rows, but that's cosmetic only —
  // enforce it here too so a crafted request can't ban staff (including
  // self-banning, which would permanently lock the actor out with no one able
  // to reverse it).
  if (userId === actor.id) return { ok: false, error: "You cannot suspend your own account." }

  const admin = await createSupabaseServerAdminClient()
  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle()
  if (target?.role === "admin") {
    return { ok: false, error: "Admins cannot suspend other admins." }
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none", // ~100 years, or lift the ban
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/users")
  return { ok: true, message: banned ? "User suspended." : "User reinstated." }
}
