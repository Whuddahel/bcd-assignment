"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
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
  const { error } = await admin.from("products").update({ status }).eq("id", productId)
  if (error) return { ok: false, error: error.message }

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
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." }

  const admin = await createSupabaseServerAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none", // ~100 years, or lift the ban
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/users")
  return { ok: true, message: banned ? "User suspended." : "User reinstated." }
}
