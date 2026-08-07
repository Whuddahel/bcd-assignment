"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Eye, Trash2, TrendingUp, DollarSign, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import type { ProductVM } from "@/lib/data/types"
import { deleteProduct } from "@/lib/actions/products"
import { MintButton } from "@/components/blockchain/mint-button"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

type StatusTab = "all" | "active" | "pending_review" | "draft" | "archived" | "sold"

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all",            label: "All Listings"   },
  { value: "active",         label: "Active"         },
  { value: "pending_review", label: "Pending Review" },
  { value: "draft",          label: "Draft"          },
  { value: "archived",       label: "Rejected"       },
  { value: "sold",           label: "Sold"           },
]

const statusBadgeClass: Record<string, string> = {
  active:         "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  sold:           "border-sky-500/20 bg-sky-500/10 text-sky-400",
  pending_review: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  draft:          "border-white/10 bg-white/5 text-muted-foreground",
  archived:       "border-red-500/20 bg-red-500/10 text-red-400",
}

const statusLabel: Record<string, string> = {
  active:         "Active",
  sold:           "Sold",
  pending_review: "Pending review",
  draft:          "Draft",
  archived:       "Rejected",
}

export function ProductsClient({
  initialProducts,
  tokenIds,
}: {
  initialProducts: ProductVM[]
  tokenIds: Record<string, string | null>
}) {
  const [tab, setTab] = useState<StatusTab>("all")
  const [products, setProducts] = useState<ProductVM[]>(initialProducts)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = products.filter((p) => tab === "all" || p.status === tab)

  const totalAskValue = products.filter((p) => p.status === "active").reduce((sum, p) => sum + p.price, 0)
  const totalViews = products.reduce((s, p) => s + p.viewCount, 0)
  const totalWishlists = products.reduce((s, p) => s + p.wishlistCount, 0)

  const counts: Record<StatusTab, number> = {
    all:            products.length,
    active:         products.filter((p) => p.status === "active").length,
    pending_review: products.filter((p) => p.status === "pending_review").length,
    draft:          products.filter((p) => p.status === "draft").length,
    archived:       products.filter((p) => p.status === "archived").length,
    sold:           products.filter((p) => p.status === "sold").length,
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return
    setDeleting(id)
    const prev = products
    setProducts((cur) => cur.filter((p) => p.id !== id)) // optimistic
    const res = await deleteProduct(id)
    setDeleting(null)
    if (!res.ok) {
      setProducts(prev)
      toast.error(res.error)
      return
    }
    toast.success("Listing deleted", { description: title })
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            My <GradientText>Listings</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} total listings</p>
        </div>
        <Button className="gradient-brand gap-2 border-0 text-white hover:opacity-90" asChild>
          <Link href="/seller/products/new">
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Active listings", value: counts.active,                   icon: Eye,        color: "text-emerald-400" },
          { label: "Total ask value", value: formatPrice(totalAskValue),       icon: DollarSign, color: "text-violet-400"  },
          { label: "Total views",     value: totalViews.toLocaleString(),      icon: TrendingUp, color: "text-amber-400"   },
          { label: "Wishlisted",      value: totalWishlists.toLocaleString(),  icon: Heart,      color: "text-pink-400"    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => (
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
                tab === t.value ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-muted-foreground"
              }`}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Product</span>
          <span>Price</span>
          <span>Performance</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No listings in this category</p>
              <Button className="gradient-brand mt-4 border-0 text-white hover:opacity-90" asChild>
                <Link href="/seller/products/new">
                  <Plus className="mr-2 h-4 w-4" /> Create your first listing
                </Link>
              </Button>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2 sm:grid-cols-[2fr_1fr_1fr_auto]"
              >
                {/* Product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${p.gradient}`}>
                    {p.images[0] && (
                      <Image src={p.images[0]} alt={p.title} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusBadgeClass[p.status] ?? ""}`}
                      >
                        {statusLabel[p.status] ?? p.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {p.condition.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="hidden text-sm font-bold text-foreground sm:block">{formatPrice(p.price)}</p>

                <div className="hidden sm:block">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3" /> {p.viewCount.toLocaleString()} views
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-violet-400" /> {p.wishlistCount} wishlisted
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {(p.status === "active" || tokenIds[p.id]) && (
                    <MintButton productId={p.id} tokenId={tokenIds[p.id]} compact />
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                    <Link href={`/product/${p.slug}`} aria-label="View">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-red-400"
                    aria-label="Delete"
                    disabled={deleting === p.id}
                    onClick={() => handleDelete(p.id, p.title)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-white/5 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} shown
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
