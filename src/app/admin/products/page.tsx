import { CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_PRODUCTS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Products — Admin" }

export default function AdminProductsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Product <GradientText>Moderation</GradientText></h1>
        <p className="mt-1 text-sm text-muted-foreground">{MOCK_PRODUCTS.length} total listings</p>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Product</span>
          <span>Seller</span>
          <span>Price</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-white/5">
          {MOCK_PRODUCTS.map(p => (
            <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${p.gradient}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground capitalize">{p.categoryName}</Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${p.status === "active" ? "border-emerald-500/20 text-emerald-400" : "border-amber-500/20 text-amber-400"}`}>{p.status}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{p.sellerName}</p>
              <p className="text-sm font-bold text-foreground">{formatPrice(p.price)}</p>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                  <Link href={`/product/${p.slug}`} aria-label="View"><Eye className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10" aria-label="Approve">
                  <CheckCircle className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" aria-label="Reject">
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
