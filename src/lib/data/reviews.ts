import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapReview, type ReviewVM } from "./types"
import type { OrderStatus } from "@/types/database"

const REVIEW_SELECT = "*, profiles(full_name, avatar_url)"

export async function getReviewsForProduct(productId: string): Promise<ReviewVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return data.map((r) => mapReview(r as never))
}

export type ReviewSummary = {
  average: number
  count: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from("reviews").select("rating").eq("product_id", productId)

  const rows = data ?? []
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"]
  let sum = 0
  for (const r of rows) {
    const n = r.rating as 1 | 2 | 3 | 4 | 5
    distribution[n] = (distribution[n] ?? 0) + 1
    sum += r.rating
  }
  return {
    average: rows.length ? sum / rows.length : 0,
    count: rows.length,
    distribution,
  }
}

// A review only counts as a verified purchase once the order actually went
// through — not "pending" (payment not yet confirmed) or "cancelled"/"refunded"
// (never happened or was undone).
const QUALIFYING_ORDER_STATUSES: OrderStatus[] = ["confirmed", "shipped", "delivered"]

/** The buyer's own order_item for this product, if they've actually bought it. */
export async function findPurchaseForReview(
  userId: string,
  productId: string,
): Promise<{ orderId: string } | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("order_items")
    .select("order_id, orders!inner(buyer_id, status)")
    .eq("product_id", productId)
    .eq("orders.buyer_id", userId)
    .in("orders.status", QUALIFYING_ORDER_STATUSES)
    .limit(1)
    .maybeSingle()

  return data ? { orderId: data.order_id } : null
}

/** A few recent high-rated reviews for marketing/testimonials. */
export async function getRecentReviews(limit = 6): Promise<ReviewVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .gte("rating", 4)
    .order("created_at", { ascending: false })
    .limit(limit)

  return (data ?? []).map((r) => mapReview(r as never))
}
