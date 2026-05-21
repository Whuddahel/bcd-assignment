"use client"

import { useState } from "react"
import {
  Truck, CheckCircle, Clock, Package, DollarSign,
  ChevronDown, X, ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_ORDERS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

const BUYER_NAMES: Record<string, string> = {
  "ord-01": "Emma Wilson",
  "ord-02": "Priya Sharma",
  "ord-03": "Luca Ferretti",
}

type OrderStatus = "delivered" | "shipped" | "confirmed" | "pending"
type TabKey = "all" | OrderStatus

const TABS: { value: TabKey; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "pending",   label: "Pending"   },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped",   label: "Shipped"   },
  { value: "delivered", label: "Delivered" },
]

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

const StatusIcon: Record<string, React.ElementType> = {
  delivered: CheckCircle,
  shipped:   Truck,
  confirmed: Package,
  pending:   Clock,
}

export default function SellerOrdersPage() {
  const [tab,         setTab]         = useState<TabKey>("all")
  const [trackingFor, setTrackingFor] = useState<string | null>(null)
  const [trackingNum, setTrackingNum] = useState("")
  const [shipped,     setShipped]     = useState<Set<string>>(new Set())

  const visible = MOCK_ORDERS.filter((o) => tab === "all" || o.status === tab)

  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0)
  const needsAction  = MOCK_ORDERS.filter(
    (o) => (["pending", "confirmed"] as string[]).includes(o.status) && !shipped.has(o.id),
  ).length

  const counts: Record<TabKey, number> = {
    all:       MOCK_ORDERS.length,
    pending:   MOCK_ORDERS.filter((o) => (o.status as string) === "pending").length,
    confirmed: MOCK_ORDERS.filter((o) => o.status === "confirmed").length,
    shipped:   MOCK_ORDERS.filter((o) => o.status === "shipped").length,
    delivered: MOCK_ORDERS.filter((o) => o.status === "delivered").length,
  }

  function markShipped(orderId: string) {
    if (!trackingNum.trim()) {
      toast.error("Enter a tracking number first")
      return
    }
    setShipped((prev) => new Set([...prev, orderId]))
    setTrackingFor(null)
    setTrackingNum("")
    toast.success(`Order #${orderId} marked as shipped`)
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Order <GradientText>Management</GradientText>
        </h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="glass-card rounded-xl p-4">
          <DollarSign className="h-4 w-4 text-violet-400" />
          <p className="mt-2 text-xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
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
          <p className="mt-2 text-xl font-bold text-foreground">{counts.delivered}</p>
          <p className="text-[11px] text-muted-foreground">Delivered</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              tab === t.value
                ? "bg-violet-500/15 text-violet-300"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tab === t.value
                  ? "bg-violet-500/20 text-violet-300"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Order</span>
          <span>Buyer</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        <div className="divide-y divide-white/5">
          {visible.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No orders in this category
            </div>
          ) : (
            visible.map((order) => {
              const isShipped   = shipped.has(order.id)
              const effectiveStatus = isShipped ? "shipped" : order.status
              const canShip     = order.status === "confirmed" && !isShipped
              const buyer       = BUYER_NAMES[order.id] ?? "Anonymous"
              const Icon        = StatusIcon[effectiveStatus] ?? Package

              return (
                <div key={order.id} className="transition-colors hover:bg-white/2">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    {/* Order */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${order.product.gradient}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {order.product.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          #{order.id} · {order.date}
                        </p>
                      </div>
                    </div>

                    <p className="hidden text-sm text-foreground sm:block">{buyer}</p>
                    <p className="hidden text-sm font-bold text-foreground sm:block">
                      {formatPrice(order.total)}
                    </p>

                    <div className="hidden items-center gap-1.5 sm:flex">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <Badge
                        variant="outline"
                        className={`w-fit capitalize text-xs ${statusStyle[effectiveStatus] ?? ""}`}
                      >
                        {effectiveStatus}
                      </Badge>
                    </div>

                    {/* Action */}
                    <div>
                      {canShip ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 text-xs"
                          onClick={() =>
                            setTrackingFor(trackingFor === order.id ? null : order.id)
                          }
                        >
                          <Truck className="h-3 w-3" />
                          Ship
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${
                              trackingFor === order.id ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                      ) : (
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ArrowRight className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline tracking input */}
                  {trackingFor === order.id && (
                    <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                      <Truck className="h-4 w-4 shrink-0 text-violet-400" />
                      <Input
                        value={trackingNum}
                        onChange={(e) => setTrackingNum(e.target.value)}
                        placeholder="Enter tracking number (e.g. DHL-48291…)"
                        className="h-8 border-white/10 bg-white/5 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && markShipped(order.id)}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="gradient-brand h-8 shrink-0 border-0 text-white text-xs hover:opacity-90"
                        onClick={() => markShipped(order.id)}
                      >
                        Confirm
                      </Button>
                      <button
                        onClick={() => { setTrackingFor(null); setTrackingNum("") }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Revenue footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {visible.length} order{visible.length !== 1 ? "s" : ""} shown
          </p>
          <p className="text-sm text-muted-foreground">
            Total revenue:{" "}
            <span className="ml-1 font-bold text-foreground">{formatPrice(totalRevenue)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
