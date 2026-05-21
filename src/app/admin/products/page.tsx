"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, XCircle, Eye, Search, Package, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_PRODUCTS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

type TabKey = "all" | "active" | "pending" | "draft" | "sold"

const TABS: { value: TabKey; label: string }[] = [
  { value: "all",     label: "All"            },
  { value: "active",  label: "Active"         },
  { value: "pending", label: "Pending Review" },
  { value: "draft",   label: "Draft"          },
  { value: "sold",    label: "Sold"           },
]

// Mock: treat first 3 as "pending" for review demo
const PRODUCTS_WITH_PENDING = MOCK_PRODUCTS.map((p, i) => ({
  ...p,
  status: (i < 3 ? "pending" : p.status) as MockStatus,
}))

type MockStatus = "active" | "pending" | "draft" | "sold"

const statusStyle: Record<MockStatus, string> = {
  active:  "border-emerald-500/20 text-emerald-400",
  pending: "border-amber-500/20 text-amber-400",
  draft:   "border-white/10 text-muted-foreground",
  sold:    "border-sky-500/20 text-sky-400",
}

export default function AdminProductsPage() {
  const [tab,   setTab]   = useState<TabKey>("all")
  const [query, setQuery] = useState("")

  const filtered = PRODUCTS_WITH_PENDING.filter((p) => {
    const matchesTab   = tab === "all" || p.status === tab
    const matchesQuery =
      query === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(query.toLowerCase())
    return matchesTab && matchesQuery
  })

  const counts: Record<TabKey, number> = {
    all:     PRODUCTS_WITH_PENDING.length,
    active:  PRODUCTS_WITH_PENDING.filter((p) => p.status === "active").length,
    pending: PRODUCTS_WITH_PENDING.filter((p) => p.status === "pending").length,
    draft:   PRODUCTS_WITH_PENDING.filter((p) => p.status === "draft").length,
    sold:    PRODUCTS_WITH_PENDING.filter((p) => p.status === "sold").length,
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Product <GradientText>Moderation</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {PRODUCTS_WITH_PENDING.length} total listings
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total listings",   value: counts.all,     icon: Package,      color: "text-violet-400"  },
          { label: "Active",           value: counts.active,  icon: TrendingUp,   color: "text-emerald-400" },
          { label: "Pending review",   value: counts.pending, icon: AlertCircle,  color: "text-amber-400"   },
          { label: "Sold",             value: counts.sold,    icon: CheckCircle,  color: "text-sky-400"     },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              tab === t.value
                ? "bg-amber-500/15 text-amber-300"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tab === t.value
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or seller…"
          className="border-white/10 bg-white/5 pl-9 focus-visible:ring-amber-500/50"
        />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Product</span>
          <span>Seller</span>
          <span>Price</span>
          <span>Views</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No listings found
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
              >
                {/* Product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${p.gradient}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-white/10 text-muted-foreground capitalize"
                      >
                        {p.categoryName}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${statusStyle[p.status]}`}
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                  {p.sellerName}
                </p>
                <p className="hidden text-sm font-bold text-foreground sm:block">
                  {formatPrice(p.price)}
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {p.viewCount.toLocaleString()}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link href={`/product/${p.slug}`} aria-label="View">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10"
                    aria-label="Approve"
                    onClick={() => toast.success(`Approved: ${p.title}`)}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                    aria-label="Reject"
                    onClick={() => toast.error(`Rejected: ${p.title}`)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-white/5 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {PRODUCTS_WITH_PENDING.length} listings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
