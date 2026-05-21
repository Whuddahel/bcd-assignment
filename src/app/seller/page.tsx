"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { TrendingUp, Package, ShoppingBag, Star, Plus, ArrowUpRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_SELLER_STATS, MOCK_ORDERS, MOCK_PRODUCTS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400",
  shipped:   "bg-sky-500/10 text-sky-400",
  confirmed: "bg-violet-500/10 text-violet-400",
  pending:   "bg-amber-500/10 text-amber-400",
}

export default function SellerDashboard() {
  const stats = MOCK_SELLER_STATS
  const myProducts = MOCK_PRODUCTS.filter(p => p.sellerId === "sp-01").slice(0, 3)

  const statCards = [
    { label: "Total Revenue",    value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: "text-violet-400", sub: "+12% this month" },
    { label: "Total Sales",      value: stats.totalSales,                icon: ShoppingBag, color: "text-pink-400",  sub: "47 completed" },
    { label: "Active Listings",  value: stats.activeListings,            icon: Package,    color: "text-amber-400",  sub: "12 live now" },
    { label: "Avg. Rating",      value: `${stats.averageRating} ★`,     icon: Star,       color: "text-emerald-400", sub: "From 31 reviews" },
  ]

  return (
    <div>
      {/* Header */}
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

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, sub }, i) => (
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
            <p className="mt-1 text-[10px] text-violet-400">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="mb-8 glass-card rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Monthly Revenue</h2>
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" /> +28% YoY
          </span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyRevenue} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.018 280)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "oklch(0.11 0.022 280)", border: "1px solid oklch(0.22 0.018 280)", borderRadius: "12px", color: "oklch(0.95 0.010 280)", fontSize: 12 }}
                formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString()}`, "Revenue"] : ["", ""]}
                cursor={{ fill: "oklch(1 0 0 / 0.03)" }}
              />
              <Bar dataKey="revenue" fill="oklch(0.55 0.27 280)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link href="/seller/orders" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_ORDERS.map(order => (
              <div key={order.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
                <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${order.product.gradient}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{order.product.title}</p>
                  <p className="text-[10px] text-muted-foreground">{order.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-foreground">{formatPrice(order.total)}</p>
                  <Badge className={`mt-0.5 text-[10px] border-0 ${statusStyle[order.status]}`}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active listings */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your Listings</h2>
            <Link href="/seller/products" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
                <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${p.gradient}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.wishlistCount} wishlisted · {p.viewCount.toLocaleString()} views</p>
                </div>
                <p className="shrink-0 text-xs font-bold text-foreground">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
