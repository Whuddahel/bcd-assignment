import Link from "next/link"
import { TrendingUp, Package, ShoppingBag, Star, Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { RevenueBarChart } from "@/components/dashboard/revenue-bar-chart"
import { toLast6Months } from "@/lib/dashboard"
import { requireUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400",
  shipped:   "bg-sky-500/10 text-sky-400",
  confirmed: "bg-violet-500/10 text-violet-400",
  pending:   "bg-amber-500/10 text-amber-400",
  refunded:  "bg-red-500/10 text-red-400",
}

async function getSellerDashboard(userId: string) {
  const admin = await createSupabaseServerAdminClient()
  const { data: seller } = await admin
    .from("seller_profiles")
    .select("id, business_name, rating, review_count")
    .eq("user_id", userId)
    .maybeSingle()

  if (!seller) return null

  const [{ data: items }, { count: activeListings }, { data: products }] = await Promise.all([
    admin
      .from("order_items")
      .select("price, quantity, title, orders(id, status, created_at)")
      .eq("seller_id", seller.id),
    admin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", seller.id)
      .eq("status", "active"),
    admin
      .from("products")
      .select("id, title, price, wishlist_count, view_count")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const soldItems = (items ?? []).filter((i) => {
    const order = i.orders as unknown as { status: string } | null
    return order && order.status !== "refunded" && order.status !== "cancelled"
  })

  const totalRevenue = soldItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const orderIds = new Set(
    soldItems.map((i) => (i.orders as unknown as { id: string }).id),
  )

  const monthly = toLast6Months(
    soldItems.map((i) => {
      const order = i.orders as unknown as { created_at: string }
      return { created_at: order.created_at, amount: (i.price * i.quantity) / 100 }
    }),
  )

  const recent = (items ?? [])
    .map((i) => {
      const order = i.orders as unknown as { id: string; status: string; created_at: string } | null
      return order
        ? { id: order.id, status: order.status, createdAt: order.created_at, title: i.title, total: i.price * i.quantity }
        : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5)

  return {
    businessName: seller.business_name,
    totalRevenue,
    totalSales: orderIds.size,
    activeListings: activeListings ?? 0,
    rating: seller.rating ?? 0,
    reviewCount: seller.review_count,
    monthly,
    recent,
    products: products ?? [],
  }
}

export default async function SellerDashboard() {
  const user = await requireUser(["seller", "admin"])
  const data = await getSellerDashboard(user.id)
  if (!data) {
    return (
      <div>
        <DashboardHeader />
        <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          No seller profile is linked to this account yet.
        </div>
      </div>
    )
  }

  const statCards = [
    { label: "Total Revenue",   value: formatPrice(data.totalRevenue / 100), icon: TrendingUp, color: "text-violet-400" },
    { label: "Total Sales",     value: data.totalSales,                      icon: ShoppingBag, color: "text-pink-400"  },
    { label: "Active Listings", value: data.activeListings,                  icon: Package,    color: "text-amber-400"  },
    { label: "Avg. Rating",     value: `${data.rating} ★`,                   icon: Star,       color: "text-emerald-400" },
  ]

  return (
    <div>
      <DashboardHeader />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 glass-card rounded-2xl p-6">
        <h2 className="mb-5 font-semibold text-foreground">Monthly Revenue</h2>
        <RevenueBarChart data={data.monthly} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link href="/seller/orders" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No orders yet.</p>
            ) : (
              data.recent.map((o, i) => (
                <div key={`${o.id}-${i}`} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{o.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-foreground">{formatPrice(o.total / 100)}</p>
                    <Badge className={`mt-0.5 text-[10px] border-0 capitalize ${statusStyle[o.status] ?? ""}`}>{o.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your Listings</h2>
            <Link href="/seller/products" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.products.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No listings yet.</p>
            ) : (
              data.products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.wishlist_count} wishlisted · {p.view_count.toLocaleString()} views
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-foreground">{formatPrice(p.price / 100)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardHeader() {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Your <GradientText>Dashboard</GradientText>
        </h1>
      </div>
      <Button className="gradient-brand gap-2 border-0 text-white hover:opacity-90" asChild>
        <Link href="/seller/products/new"><Plus className="h-4 w-4" /> New Listing</Link>
      </Button>
    </div>
  )
}
