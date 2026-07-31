"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts"
import { TrendingUp, Package, Star, Users } from "lucide-react"
import { GradientText } from "@/components/brand/gradient-text"
import { formatPrice } from "@/lib/utils"
import type { SellerStats } from "@/lib/data/dashboard"
import type { ProductVM } from "@/lib/data/types"

type CategoryDatum = { name: string; value: number; color: string }

export function AnalyticsClient({
  stats,
  categoryData,
  topProducts,
}: {
  stats: SellerStats
  categoryData: CategoryDatum[]
  topProducts: ProductVM[]
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          <GradientText>Analytics</GradientText>
        </h1>
      </div>

      {/* KPI row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Revenue",   value: formatPrice(stats.totalRevenue),  icon: TrendingUp, color: "text-violet-400" },
          { label: "Units Sold",      value: stats.totalSales,                  icon: Package,   color: "text-pink-400"   },
          { label: "Active Listings", value: stats.activeListings,              icon: Users,     color: "text-amber-400"  },
          { label: "Avg. Rating",     value: `${stats.averageRating} ★`,       icon: Star,      color: "text-emerald-400"},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="mt-3 text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="mb-6 glass-card rounded-2xl p-6">
        <h2 className="mb-5 font-semibold text-foreground">Revenue Trend</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.55 0.27 280)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.27 280)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.018 280)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "oklch(0.11 0.022 280)", border: "1px solid oklch(0.22 0.018 280)", borderRadius: "12px", color: "oklch(0.95 0.010 280)", fontSize: 12 }}
                formatter={(value) => typeof value === 'number' ? [`$${value.toLocaleString()}`, "Revenue"] : ["", ""]}
              />
              <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.27 280)" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 font-semibold text-foreground">Sales by Category</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: "oklch(0.55 0.025 280)", fontSize: 11 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: "oklch(0.11 0.022 280)", border: "1px solid oklch(0.22 0.018 280)", borderRadius: "12px", fontSize: 12 }}
                  formatter={(value) => typeof value === 'number' ? [`${value}%`, "Share"] : ["", ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top performers */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-5 font-semibold text-foreground">Top Performing Listings</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <div className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${p.gradient}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{p.title}</p>
                  <p className="text-[10px] text-muted-foreground">{p.viewCount.toLocaleString()} views · {p.wishlistCount} wishlisted</p>
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
