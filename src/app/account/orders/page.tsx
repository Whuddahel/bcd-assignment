import Link from "next/link"
import { Package, ChevronRight, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_ORDERS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import { useLiveData } from "@/lib/config"
import { getSessionUser } from "@/lib/auth/session"
import { toast } from "sonner"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Orders" }

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
}

type RealOrder = {
  id: string
  status: string
  total_amount: number
  created_at: string
  order_items: { id: string; title: string; price: number; quantity: number }[]
}

async function getRealOrders(): Promise<RealOrder[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at, order_items(id, title, price, quantity)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    toast.error("Error fetching orders: " + error.message)
    return []
  }

  return data ?? []
}

export default async function OrdersPage() {
  const realOrders = await getRealOrders()

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Order <GradientText>History</GradientText></h1>
      </div>

      {realOrders.length === 0 ? (
          <div className="glass-card rounded-2xl py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold text-foreground">No orders yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse our rare collectibles to place your first order.
            </p>
            <Button className="gradient-brand mt-6 border-0 text-white" asChild>
              <Link href="/browse">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {realOrders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-5 transition-all hover:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order</p>
                    <p className="font-mono text-sm font-semibold text-foreground uppercase">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm text-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatPrice(order.total_amount / 100)}
                    </p>
                  </div>
                  <Badge variant="outline" className={`capitalize ${statusStyle[order.status] ?? ""}`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/5">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-foreground">
                        {formatPrice((item.price * item.quantity) / 100)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
