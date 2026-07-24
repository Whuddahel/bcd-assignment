import { Package, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { RefundButton } from "@/components/orders/refund-button"
import { SellerOrdersMock } from "./seller-orders-mock"
import { useLiveData } from "@/lib/config"
import { getSessionUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  refunded:  "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
}

type SellerOrderRow = {
  orderId: string
  status: string
  createdAt: string
  title: string
  quantity: number
  lineTotal: number // cents
}

async function getSellerOrders(): Promise<SellerOrderRow[] | null> {
  const user = await getSessionUser()
  if (!user) return null

  const admin = await createSupabaseServerAdminClient()
  const { data: seller } = await admin
    .from("seller_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!seller) return null

  // A seller sees their own line items, joined to the parent order for status.
  const { data } = await admin
    .from("order_items")
    .select("price, quantity, title, orders(id, status, created_at)")
    .eq("seller_id", seller.id)
    .order("created_at", { referencedTable: "orders", ascending: false })

  if (!data) return []

  return data
    .filter((item) => item.orders)
    .map((item) => {
      const order = item.orders as unknown as { id: string; status: string; created_at: string }
      return {
        orderId: order.id,
        status: order.status,
        createdAt: order.created_at,
        title: item.title,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      }
    })
}

export default async function SellerOrdersPage() {
  if (!useLiveData) {
    return <SellerOrdersMock />
  }

  const rows = await getSellerOrders()

  if (!rows) {
    return (
      <div>
        <Header />
        <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          No seller profile is linked to this account yet.
        </div>
      </div>
    )
  }

  const totalEarned = rows
    .filter((r) => r.status !== "refunded")
    .reduce((s, r) => s + r.lineTotal, 0)
  const needsAction = rows.filter((r) => ["pending", "confirmed"].includes(r.status)).length
  const delivered = rows.filter((r) => r.status === "delivered").length

  return (
    <div>
      <Header />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-4">
          <DollarSign className="h-4 w-4 text-violet-400" />
          <p className="mt-2 text-xl font-bold text-foreground">{formatPrice(totalEarned / 100)}</p>
          <p className="text-[11px] text-muted-foreground">Total earned</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <Clock className={`h-4 w-4 ${needsAction > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
          <p className={`mt-2 text-xl font-bold ${needsAction > 0 ? "text-amber-400" : "text-foreground"}`}>
            {needsAction}
          </p>
          <p className="text-[11px] text-muted-foreground">Need action</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <p className="mt-2 text-xl font-bold text-foreground">{delivered}</p>
          <p className="text-[11px] text-muted-foreground">Delivered</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders for your listings will appear here once customers buy.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Item</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <div
                key={`${row.orderId}-${i}`}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2 sm:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {row.title} <span className="text-muted-foreground">× {row.quantity}</span>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    #{row.orderId.slice(0, 8)} · {new Date(row.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="hidden text-sm font-bold text-foreground sm:block">
                  {formatPrice(row.lineTotal / 100)}
                </p>
                <div className="hidden sm:block">
                  <Badge variant="outline" className={`capitalize text-xs ${statusStyle[row.status] ?? ""}`}>
                    {row.status}
                  </Badge>
                </div>
                <RefundButton orderId={row.orderId} disabled={row.status === "refunded"} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
      <h1 className="mt-1 font-display text-3xl font-bold">
        Order <GradientText>Management</GradientText>
      </h1>
    </div>
  )
}
