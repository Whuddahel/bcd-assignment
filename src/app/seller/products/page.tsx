import Link from "next/link"
import { Plus, Eye, Edit, Trash2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_PRODUCTS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Listings" }

const myProducts = MOCK_PRODUCTS.filter(p => p.sellerId === "sp-01")

export default function SellerProductsPage() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
          <h1 className="mt-1 font-display text-3xl font-bold">My <GradientText>Listings</GradientText></h1>
          <p className="mt-1 text-sm text-muted-foreground">{myProducts.length} active listings</p>
        </div>
        <Button className="gradient-brand gap-2 border-0 text-white hover:opacity-90" asChild>
          <Link href="/seller/products/new"><Plus className="h-4 w-4" /> New Listing</Link>
        </Button>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Product</span>
          <span>Price</span>
          <span className="hidden sm:block">Performance</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {myProducts.map(p => (
            <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2">
              {/* Product */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${p.gradient}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${
                        p.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                        p.status === "sold"   ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-400" :
                        "border-amber-500/20 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {p.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground capitalize">{p.condition.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <p className="text-sm font-bold text-foreground">{formatPrice(p.price)}</p>

              {/* Performance */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Eye className="h-3 w-3" /> {p.viewCount.toLocaleString()} views
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <TrendingUp className="h-3 w-3 text-violet-400" /> {p.wishlistCount} wishlisted
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                  <Link href={`/product/${p.slug}`} aria-label="View"><Eye className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Edit">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
