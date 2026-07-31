import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapOrder, type OrderVM } from "./types"

const ORDER_SELECT =
  "*, order_items(*, products(slug, category_id, categories(slug), product_images(url, is_primary)))"

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
