import Link from "next/link"
import { Package, ChevronRight, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_ORDERS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Orders" }

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function OrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Order <GradientText>History</GradientText></h1>
      </div>

      {MOCK_ORDERS.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Browse our rare collectibles to place your first order.</p>
          <Button className="gradient-brand mt-6 border-0 text-white" asChild>
            <Link href="/browse">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_ORDERS.map(order => (
            <div key={order.id} className="glass-card rounded-2xl p-5 transition-all hover:border-white/10">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Order</p>
                  <p className="font-mono text-sm font-semibold text-foreground uppercase">#{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm text-foreground">{order.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
                </div>
                <Badge variant="outline" className={`capitalize ${statusStyle[order.status] ?? ""}`}>
                  {order.status}
                </Badge>
              </div>

              {/* Product */}
              <div className="mt-4 flex items-center gap-4">
                <div className={`h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br ${order.product.gradient}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{order.product.title}</p>
                  <p className="text-xs text-muted-foreground">{order.product.sellerName}</p>
                  {order.tracking && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-sky-400">
                      <Truck className="h-3 w-3" /> Tracking: {order.tracking}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" className="shrink-0 border-white/10 hover:bg-white/5" asChild>
                  <Link href={`/product/${order.product.slug}`}>
                    View item <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
