import { Package, Heart, Star, ChevronRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_ORDERS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Account" }

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function AccountPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Welcome back, <GradientText>Emma</GradientText>
        </h1>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Orders",      value: MOCK_ORDERS.length, icon: Package, color: "text-violet-400" },
          { label: "Wishlisted",  value: 5,                  icon: Heart,   color: "text-pink-400"   },
          { label: "Collection",  value: 3,                  icon: Star,    color: "text-amber-400"  },
          { label: "Verified",    value: "✓",                icon: CheckCircle, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <Icon className={`h-5 w-5 ${color}`} />
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="glass-card rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Orders</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_ORDERS.map(order => (
            <div key={order.id} className="flex items-center gap-4 rounded-xl border border-white/5 p-4 transition-colors hover:border-white/10">
              <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${order.product.gradient}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{order.product.title}</p>
                <p className="text-xs text-muted-foreground">Order #{order.id} · {order.date}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
                <Badge variant="outline" className={`text-[10px] capitalize ${statusStyle[order.status] ?? ""}`}>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="h-auto justify-start gap-3 border-white/10 p-4 hover:bg-white/5" asChild>
          <Link href="/browse">
            <Package className="h-4 w-4 text-violet-400" />
            <div className="text-left">
              <p className="text-sm font-medium">Continue Shopping</p>
              <p className="text-xs text-muted-foreground">Browse 50+ rare items</p>
            </div>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto justify-start gap-3 border-white/10 p-4 hover:bg-white/5" asChild>
          <Link href="/account/profile">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-sm font-medium">Complete Profile</p>
              <p className="text-xs text-muted-foreground">Add shipping address</p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  )
}
