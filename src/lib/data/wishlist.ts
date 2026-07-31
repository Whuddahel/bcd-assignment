import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapProduct, type ProductVM, type ProductRow } from "./types"

const NESTED_PRODUCT =
  "products(*, product_images(url,sort_order,is_primary), seller_profiles(business_name,verified), categories(name,slug))"

export async function getWishlist(userId: string): Promise<ProductVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(NESTED_PRODUCT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getWishlist error:", error.message)
    return []
  }

  return data
    .map((row) => (row as { products: ProductRow | null }).products)
    .filter((p): p is ProductRow => Boolean(p))
    .map(mapProduct)
}

/** The set of product ids this user has wishlisted (for card default states). */
export async function getWishlistIds(userId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId)

  return new Set((data ?? []).map((r) => r.product_id))
}
