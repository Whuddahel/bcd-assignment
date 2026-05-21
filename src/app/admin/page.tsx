"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Users, Package, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_ADMIN_STATS, MOCK_PRODUCTS, MOCK_SELLERS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const pendingProducts = MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 3)

export default function AdminDashboard() {
  const s = MOCK_ADMIN_STATS

  const statCards = [
    { label: "Total Users",     value: s.totalUsers.toLocaleString(), icon: Users,       color: "text-violet-400", delta: "+42 this week" },
    { label: "Total Sellers",   value: s.totalSellers,                icon: Package,     color: "text-pink-400",   delta: "48 verified"   },
    { label: "Platform Revenue",value: formatPrice(s.totalRevenue),   icon: TrendingUp,  color: "text-amber-400",  delta: "+28% YoY"      },
    { label: "Total Orders",    value: s.totalOrders.toLocaleString(),icon: ShoppingBag, color: "text-emerald-400", delta: "892 completed" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin Panel</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Platform <GradientText>Overview</GradientText>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {s.pendingApprovals > 0 && (
            <Badge className="gap-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30">
              <AlertCircle className="h-3 w-3" />
              {s.pendingApprovals} pending approvals
            </Badge>
          )}
          {s.openTickets > 0 && (
            <Badge className="gap-1.5 bg-red-500/20 text-red-300 border-red-500/30">
              <Clock className="h-3 w-3" />
              {s.openTickets} open tickets
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, delta }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
            className="glass-card rounded-2xl p-5"
          >
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-[10px] text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> {delta}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mb-8 glass-card rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Monthly Revenue</h2>
          <span className="text-xs text-muted-foreground">Last 6 months</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={s.monthlyRevenue} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.018 280)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "oklch(0.11 0.022 280)", border: "1px solid oklch(0.22 0.018 280)", borderRadius: "12px", color: "oklch(0.95 0.010 280)", fontSize: 12 }}
                formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString()}`, "Revenue"] : ["", ""]}
                cursor={{ fill: "oklch(1 0 0 / 0.03)" }}
              />
              <Bar dataKey="revenue" fill="oklch(0.75 0.165 70)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending approvals */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pending Approvals</h2>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
              {s.pendingApprovals} items
            </Badge>
          </div>
          <div className="space-y-3">
            {pendingProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
                <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${p.gradient}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.sellerName} · {formatPrice(p.price)}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-emerald-400 hover:bg-emerald-500/10">
                    <CheckCircle className="mr-1 h-3 w-3" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top sellers */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Top Sellers</h2>
          </div>
          <div className="space-y-3">
            {MOCK_SELLERS.slice(0, 5).map((seller, i) => (
              <div key={seller.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-brand text-xs font-bold text-white">
                  {seller.businessName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{seller.businessName}</p>
                  <p className="text-[10px] text-muted-foreground">{seller.totalSales} sales · ★ {seller.rating}</p>
                </div>
                {seller.verified && (
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
