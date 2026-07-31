"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"

export type WishlistResult =
  | { ok: true; wishlisted: boolean }
  | { ok: false; error: string }

/** Toggle a product in the current user's wishlist. */
export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  const user = await getSessionUser()
  if (!user || user.isMock) {
    return { ok: false, error: "Please sign in to save items." }
  }

  const supabase = await createSupabaseServerClient()

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from("wishlist_items").delete().eq("id", existing.id)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/account/wishlist")
    return { ok: true, wishlisted: false }
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: user.id, product_id: productId })
  if (error) return { ok: false, error: error.message }

  revalidatePath("/account/wishlist")
  return { ok: true, wishlisted: true }
}
