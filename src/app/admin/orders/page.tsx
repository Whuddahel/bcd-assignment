import { Package, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { RefundButton } from "@/components/orders/refund-button"
import { useLiveData } from "@/lib/config"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Order Oversight" }

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  refunded:  "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
}

type AdminOrder = {
  id: string
  status: string
  total_amount: number
  created_at: string
  order_items: { id: string; title: string; quantity: number }[]
}

async function getAllOrders(): Promise<AdminOrder[]> {
  const admin = await createSupabaseServerAdminClient()
  const { data } = await admin
    .from("orders")
    .select("id, status, total_amount, created_at, order_items(id, title, quantity)")
    .order("created_at", { ascending: false })
    .limit(100)
  return data ?? []
}

export default async function AdminOrdersPage() {
  const orders = useLiveData ? await getAllOrders() : []

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Order <GradientText>Oversight</GradientText>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every order on the platform. Admins can issue a full refund on any paid order.
        </p>
      </div>

      {!useLiveData ? (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-foreground">Live configuration required</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Order oversight reads live orders from Supabase. Set{" "}
                <code className="rounded bg-white/10 px-1 text-xs">DEVELOPMENT_MODE=false</code> with
                live keys to enable it.
              </p>
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Orders will appear here as customers check out.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Order</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-white/5">
            {orders.map((order) => {
              const itemLabel =
                order.order_items[0]?.title ?? "Order"
              const extra = order.order_items.length - 1
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2 sm:grid-cols-[2fr_1fr_1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {itemLabel}
                      {extra > 0 && <span className="text-muted-foreground"> +{extra} more</span>}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="hidden text-sm font-bold text-foreground sm:block">
                    {formatPrice(order.total_amount / 100)}
                  </p>

                  <div className="hidden sm:block">
                    <Badge variant="outline" className={`capitalize text-xs ${statusStyle[order.status] ?? ""}`}>
                      {order.status}
                    </Badge>
                  </div>

                  <RefundButton orderId={order.id} disabled={order.status === "refunded"} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
