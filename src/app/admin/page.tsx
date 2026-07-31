import { Users, Package, ShoppingBag, TrendingUp, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { RevenueBarChart } from "@/components/dashboard/revenue-bar-chart"
import { toLast6Months } from "@/lib/dashboard"
import { requireUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"

async function getAdminDashboard() {
  const admin = await createSupabaseServerAdminClient()

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: pendingApprovals },
    { data: orders },
    { data: topSellers },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("seller_profiles").select("id", { count: "exact", head: true }),
    admin.from("seller_profiles").select("id", { count: "exact", head: true }).eq("verified", false),
    admin.from("orders").select("total_amount, platform_fee, status, created_at"),
    admin
      .from("seller_profiles")
      .select("id, business_name, total_sales, rating, verified")
      .order("total_sales", { ascending: false })
      .limit(5),
  ])

  const paidOrders = (orders ?? []).filter((o) => o.status !== "refunded" && o.status !== "cancelled")
  const platformRevenue = paidOrders.reduce((s, o) => s + o.platform_fee, 0)
  const gmv = paidOrders.reduce((s, o) => s + o.total_amount, 0)

  const monthly = toLast6Months(
    paidOrders.map((o) => ({ created_at: o.created_at, amount: o.total_amount / 100 })),
  )

  return {
    totalUsers: totalUsers ?? 0,
    totalSellers: totalSellers ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    platformRevenue,
    gmv,
    totalOrders: orders?.length ?? 0,
    monthly,
    topSellers: topSellers ?? [],
  }
}

export default async function AdminDashboard() {
  await requireUser(["admin"])
  const s = await getAdminDashboard()

  const statCards = [
    { label: "Total Users",      value: s.totalUsers.toLocaleString(),      icon: Users,       color: "text-violet-400" },
    { label: "Total Sellers",    value: s.totalSellers,                     icon: Package,     color: "text-pink-400"   },
    { label: "Platform Revenue", value: formatPrice(s.platformRevenue / 100), icon: TrendingUp, color: "text-amber-400" },
    { label: "Total Orders",     value: s.totalOrders.toLocaleString(),     icon: ShoppingBag, color: "text-emerald-400" },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin Panel</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Platform <GradientText>Overview</GradientText>
          </h1>
        </div>
        {s.pendingApprovals > 0 && (
          <Badge className="gap-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30">
            {s.pendingApprovals} sellers pending verification
          </Badge>
        )}
      </div>

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
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Monthly GMV</h2>
          <span className="text-xs text-muted-foreground">Last 6 months · {formatPrice(s.gmv / 100)} total</span>
        </div>
        <RevenueBarChart data={s.monthly} barColor="oklch(0.75 0.165 70)" />
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h2 className="mb-4 font-semibold text-foreground">Top Sellers</h2>
        <div className="space-y-3">
          {s.topSellers.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No sellers yet.</p>
          ) : (
            s.topSellers.map((seller, i) => (
              <div key={seller.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-brand text-xs font-bold text-white">
                  {seller.business_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{seller.business_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {seller.total_sales} sales · ★ {seller.rating ?? "—"}
                  </p>
                </div>
                {seller.verified && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-violet-400" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
