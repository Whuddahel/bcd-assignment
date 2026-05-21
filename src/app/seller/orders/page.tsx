import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_ORDERS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Seller Orders" }

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

export default function SellerOrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Order <GradientText>Management</GradientText></h1>
        <p className="mt-1 text-sm text-muted-foreground">{MOCK_ORDERS.length} orders to date</p>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Order</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-white/5">
          {MOCK_ORDERS.map(order => (
            <div key={order.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${order.product.gradient}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{order.product.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">#{order.id}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{order.date}</p>
              <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
              <Badge variant="outline" className={`w-fit capitalize text-xs ${statusStyle[order.status] ?? ""}`}>
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
