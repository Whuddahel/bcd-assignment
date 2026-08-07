import { Package, Heart, Star, ChevronRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { requireUser } from "@/lib/auth/session"
import { getOrdersForBuyer } from "@/lib/data/orders"
import { getWishlistIds } from "@/lib/data/wishlist"
import { formatPrice, formatDate } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Account" }

const statusStyle: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shipped:   "bg-sky-500/10 text-sky-400 border-sky-500/20",
  confirmed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  payment_processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded:  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

export default async function AccountPage() {
  const user = await requireUser()
  const [orders, wishlistIds] = await Promise.all([
    getOrdersForBuyer(user.id),
    getWishlistIds(user.id),
  ])

  const firstName = user.fullName?.split(" ")[0] ?? "there"
  const recent = orders.slice(0, 4)
  // Item count, not order count — matches what /account/collection actually
  // lists (an order can contain more than one item).
  const collectionCount = orders
    .filter((o) => ["confirmed", "shipped", "delivered"].includes(o.status))
    .reduce((n, o) => n + o.items.length, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Welcome back, <GradientText>{firstName}</GradientText>
        </h1>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Orders",     value: orders.length,      icon: Package,     color: "text-violet-400" },
          { label: "Wishlisted", value: wishlistIds.size,   icon: Heart,       color: "text-pink-400"   },
          { label: "Collection", value: collectionCount,    icon: Star,        color: "text-amber-400"  },
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

        {recent.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Your purchases will appear here.</p>
            <Button className="gradient-brand mt-4 border-0 text-white" asChild>
              <Link href="/browse">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((order) => (
              <div key={order.id} className="flex items-center gap-4 rounded-xl border border-white/5 p-4 transition-colors hover:border-white/10">
                <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${order.product?.gradient ?? "from-violet-600/40 to-violet-950/80"}`}>
                  {order.product?.image && (
                    <Image src={order.product.image} alt={order.product.title} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{order.product?.title ?? "Order"}</p>
                  <p className="text-xs text-muted-foreground">Order #{order.shortId} · {formatDate(order.date)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
                  <Badge variant="outline" className={`text-[10px] capitalize ${statusStyle[order.status] ?? ""}`}>
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-3">
        <Button variant="outline" className="h-auto justify-start gap-3 border-white/10 p-4 hover:bg-white/5" asChild>
          <Link href="/browse">
            <Package className="h-4 w-4 text-violet-400" />
            <div className="text-left">
              <p className="text-sm font-medium">Continue Shopping</p>
              <p className="text-xs text-muted-foreground">Browse rare items</p>
            </div>
          </Link>
        </Button>
        {/* <Button variant="outline" className="h-auto justify-start gap-3 border-white/10 p-4 hover:bg-white/5" asChild>
          <Link href="/account/profile">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-sm font-medium">Complete Profile</p>
              <p className="text-xs text-muted-foreground">Add shipping address</p>
            </div>
          </Link>
        </Button> */}
      </div>
    </div>
  )
}
