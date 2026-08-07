import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { appConfig } from "@/lib/config"

// Sellers are paid their subtotal minus the platform fee (see createSellerTransfers
// in lib/stripe/fulfillment.tsx, which pays out at exactly this rate) — so every
// seller-facing revenue figure here is net, not the raw order subtotal.
const NET_FACTOR = (100 - appConfig.stripe.platformFeePercent) / 100

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Build a trailing 6-month revenue series (dollars) from timestamped cents. */
function monthlySeries(rows: { created_at: string; amount: number }[]): { month: string; revenue: number }[] {
  const now = new Date()
  const buckets: { key: string; month: string; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS[d.getMonth()], revenue: 0 })
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]))
  for (const r of rows) {
    const d = new Date(r.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const i = index.get(key)
    if (i != null) buckets[i].revenue += r.amount / 100
  }
  return buckets.map(({ month, revenue }) => ({ month, revenue: Math.round(revenue) }))
}

export type SellerStats = {
  totalRevenue: number
  totalSales: number
  activeListings: number
  averageRating: number
  monthlyRevenue: { month: string; revenue: number }[]
}

export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  const supabase = await createSupabaseServerClient()

  const [{ data: seller }, { count: activeListings }, { data: items }] = await Promise.all([
    supabase
      .from("seller_profiles")
      .select("rating")
      .eq("id", sellerId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)
      .eq("status", "active"),
    // seller_profiles.total_revenue is seed data only — nothing updates it after
    // a real sale — so revenue is always computed live from orders here, and
    // refunded/cancelled orders are excluded so a refund doesn't keep counting
    // toward the seller's earnings.
    supabase
      .from("order_items")
      .select("price, quantity, created_at, orders(status)")
      .eq("seller_id", sellerId),
  ])

  const soldItems = (items ?? []).filter((it) => {
    const order = it.orders as unknown as { status: string } | null
    return order && order.status !== "refunded" && order.status !== "cancelled"
  })

  const itemRows = soldItems.map((it) => ({
    created_at: it.created_at,
    amount: Math.round(it.price * it.quantity * NET_FACTOR),
  }))
  const totalRevenue = itemRows.reduce((sum, r) => sum + r.amount, 0)

  return {
    totalRevenue: totalRevenue / 100,
    totalSales: soldItems.length,
    activeListings: activeListings ?? 0,
    averageRating: seller?.rating ?? 0,
    monthlyRevenue: monthlySeries(itemRows),
  }
}

export type AdminStats = {
  totalUsers: number
  totalSellers: number
  totalRevenue: number
  totalOrders: number
  pendingApprovals: number
  openTickets: number
  monthlyRevenue: { month: string; revenue: number }[]
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createSupabaseServerClient()

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: totalOrders },
    { count: pendingApprovals },
    { count: openTickets },
    { data: orders },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("seller_profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("seller_profiles").select("id", { count: "exact", head: true }).eq("verified", false),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
    supabase.from("orders").select("total_amount, created_at").neq("status", "cancelled").neq("status", "refunded"),
  ])

  const orderRows = (orders ?? []).map((o) => ({ created_at: o.created_at, amount: o.total_amount }))
  const totalRevenue = orderRows.reduce((sum, r) => sum + r.amount, 0) / 100

  return {
    totalUsers: totalUsers ?? 0,
    totalSellers: totalSellers ?? 0,
    totalRevenue,
    totalOrders: totalOrders ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    openTickets: openTickets ?? 0,
    monthlyRevenue: monthlySeries(orderRows),
  }
}

export type SupportStats = {
  open: number
  inProgress: number
  resolved: number
  total: number
}

export async function getSupportStats(): Promise<SupportStats> {
  const supabase = await createSupabaseServerClient()
  const [{ count: open }, { count: inProgress }, { count: resolved }, { count: total }] =
    await Promise.all([
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "resolved"),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }),
    ])
  return { open: open ?? 0, inProgress: inProgress ?? 0, resolved: resolved ?? 0, total: total ?? 0 }
}
