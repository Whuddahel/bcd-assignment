"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingBag, ArrowRight, TrendingDown, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { ProductCard } from "@/components/shop/product-card"
import { useCartStore } from "@/stores/cart-store"
import { MOCK_PRODUCTS } from "@/lib/mock"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

// Mock: first 7 products are wishlisted
const ALL_WISHLISTED = MOCK_PRODUCTS.slice(0, 7)

type SortKey = "date" | "price_asc" | "price_desc" | "name"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date",       label: "Date Added"        },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "name",       label: "Name A–Z"           },
]

export default function WishlistPage() {
  const [sort,    setSort]    = useState<SortKey>("date")
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const addItem = useCartStore((s) => s.addItem)

  const items = ALL_WISHLISTED
    .filter((p) => !removed.has(p.id))
    .sort((a, b) => {
      if (sort === "price_desc") return b.price - a.price
      if (sort === "price_asc")  return a.price - b.price
      if (sort === "name")       return a.title.localeCompare(b.title)
      return 0
    })

  const totalValue  = items.reduce((sum, p) => sum + p.price, 0)
  const avgValue    = items.length ? Math.round(totalValue / items.length) : 0
  const priceDrops  = items.filter((p) => p.originalPrice && p.originalPrice > p.price)

  function handleAddAll() {
    items.forEach((p) => addItem(p))
    toast.success(`${items.length} items added to cart`)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-400">Account</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            My <GradientText>Wishlist</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            onClick={handleAddAll}
            className="gradient-brand gap-2 border-0 text-white hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4" />
            Add all to cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl py-20 text-center"
        >
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Save items you love while browsing.
          </p>
          <Button className="gradient-brand mt-6 border-0 text-white" asChild>
            <Link href="/browse">
              Discover items <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Saved items",  value: items.length.toString(),         accent: false },
              { label: "Total value",  value: formatPrice(totalValue),         accent: false },
              { label: "Average",      value: formatPrice(avgValue),           accent: false },
              { label: "Price drops",  value: priceDrops.length.toString(),    accent: priceDrops.length > 0 },
            ].map(({ label, value, accent }) => (
              <div key={label} className="glass-card rounded-xl p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`mt-1 text-lg font-bold ${accent ? "text-emerald-400" : "text-foreground"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Price drop alert */}
          {priceDrops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"
            >
              <TrendingDown className="h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-sm text-emerald-300">
                <span className="font-semibold">
                  {priceDrops.length} item{priceDrops.length > 1 ? "s" : ""}
                </span>{" "}
                in your wishlist dropped in price
              </p>
            </motion.div>
          )}

          {/* Sort bar */}
          <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
            <SortAsc className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  sort === opt.value
                    ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ProductCard product={p} index={i} wishlistDefault />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
