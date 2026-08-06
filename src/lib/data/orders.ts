import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapOrder, type OrderVM } from "./types"

// The `!order_items_product_id_fkey` hint disambiguates: `products` now also
// has a *reverse* relationship to `order_items` via `resale_of_order_item_id`,
// so PostgREST can no longer auto-pick which of the two FKs joins these tables.
const ORDER_SELECT =
  "*, order_items(*, products!order_items_product_id_fkey(slug, category_id, categories(slug), product_images(url, is_primary)))"

export async function getOrdersForBuyer(buyerId: string): Promise<OrderVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getOrdersForBuyer error:", error.message)
    return []
  }
  return data.map((o) => mapOrder(o as never))
}

export async function getOrderById(id: string): Promise<OrderVM | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return mapOrder(data as never)
}

/** Orders that contain at least one line item sold by this seller. */
export async function getOrdersForSeller(sellerId: string): Promise<OrderVM[]> {
  const supabase = await createSupabaseServerClient()

  const { data: itemRows } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("seller_id", sellerId)

  const orderIds = [...new Set((itemRows ?? []).map((r) => r.order_id))]
  if (orderIds.length === 0) return []

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .in("id", orderIds)
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return data.map((o) => mapOrder(o as never))
}

// Matches RESALE_OWNED_STATUSES in lib/actions/products.ts — "delivered" is
// the exact moment the on-chain transfer to this buyer happens, so it's the
// earliest point an item can honestly be relisted.
const OWNED_STATUSES = ["delivered"]

export type ResaleCandidate = {
  orderItemId: string
  productId: string
  title: string
  image?: string
  gradient: string
  purchasePrice: number
  purchasedDate: string
}

/**
 * Which of these order_item ids have already been used to source a resale
 * listing — i.e. the buyer no longer holds the item, they relisted it. Shared
 * by the resale picker (exclude already-relisted items) and /account/collection
 * (stop showing an item as "yours" once you've sold it onward).
 */
export async function getResoldOrderItemIds(orderItemIds: string[]): Promise<Set<string>> {
  if (orderItemIds.length === 0) return new Set()
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("products")
    .select("resale_of_order_item_id")
    .in("resale_of_order_item_id", orderItemIds)
  return new Set((data ?? []).flatMap((p) => (p.resale_of_order_item_id ? [p.resale_of_order_item_id] : [])))
}

/**
 * Items a user owns (bought and had confirmed/shipped/delivered) that aren't
 * already listed for resale — the picker for "Resell from my collection".
 */
export async function getResaleCandidates(userId: string): Promise<ResaleCandidate[]> {
  const orders = await getOrdersForBuyer(userId)
  const owned = orders.filter((o) => OWNED_STATUSES.includes(o.status))
  const itemIds = owned.flatMap((o) => o.items.map((it) => it.id))
  const listedIds = await getResoldOrderItemIds(itemIds)

  return owned.flatMap((o) =>
    o.items
      .filter((it) => !listedIds.has(it.id))
      .map((it) => ({
        orderItemId: it.id,
        productId: it.productId,
        title: it.title,
        image: it.image,
        gradient: it.gradient,
        purchasePrice: it.price,
        purchasedDate: o.date,
      })),
  )
}

/** Whether a buyer has a delivered/confirmed order containing a product. */
export async function hasPurchased(buyerId: string, productId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("order_items")
    .select("id, orders!inner(buyer_id, status)")
    .eq("product_id", productId)
    .eq("orders.buyer_id", buyerId)
    .limit(1)

  return Boolean(data && data.length > 0)
}
