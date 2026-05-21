"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/shop/product-card"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock"
import { cn } from "@/lib/utils"

const CONDITIONS = ["mint", "excellent", "very_good", "good", "fair"] as const
const SORT_OPTIONS = [
  { value: "trending",   label: "Trending" },
  { value: "newest",     label: "Newest"   },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
]

const PRICE_RANGES = [
  { label: "Under $5K",       min: 0,       max: 5000    },
  { label: "$5K – $25K",      min: 5000,    max: 25000   },
  { label: "$25K – $100K",    min: 25000,   max: 100000  },
  { label: "$100K – $500K",   min: 100000,  max: 500000  },
  { label: "Over $500K",      min: 500000,  max: Infinity },
]

export default function BrowsePage() {
  const [query,     setQuery]     = useState("")
  const [category,  setCategory]  = useState<string | null>(null)
  const [condition, setCondition] = useState<string | null>(null)
  const [priceIdx,  setPriceIdx]  = useState<number | null>(null)
  const [sort,      setSort]      = useState("trending")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let items = [...MOCK_PRODUCTS]

    if (query) {
      const q = query.toLowerCase()
      items = items.filter(p => p.title.toLowerCase().includes(q) || p.sellerName.toLowerCase().includes(q))
    }
    if (category)  items = items.filter(p => p.categorySlug === category)
    if (condition) items = items.filter(p => p.condition === condition)
    if (priceIdx !== null) {
      const range = PRICE_RANGES[priceIdx]
      items = items.filter(p => p.price >= range.min && p.price <= range.max)
    }

    if (sort === "trending")    items.sort((a, b) => b.wishlistCount - a.wishlistCount)
    else if (sort === "newest") items.sort((a, b) => b.viewCount - a.viewCount)
    else if (sort === "price-asc")  items.sort((a, b) => a.price - b.price)
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price)

    return items
  }, [query, category, condition, priceIdx, sort])

  const activeFilterCount = [category, condition, priceIdx !== null ? 1 : null].filter(Boolean).length

  function clearAll() {
    setCategory(null)
    setCondition(null)
    setPriceIdx(null)
    setQuery("")
  }

  return (
    <div className="min-h-screen bg-midnight">
      {/* Page header */}
      <div className="border-b border-white/5 bg-midnight-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
              ✦ {MOCK_PRODUCTS.length} items available
            </p>
            <h1
              className="font-display font-bold tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Browse <GradientText>Collectibles</GradientText>
            </h1>
          </motion.div>

          {/* Search + filter toggle */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, seller, brand…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>

              <Button
                variant="outline"
                className="h-11 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => setFiltersOpen(o => !o)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Inline filter strip */}
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="glass-card rounded-xl p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Category */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_CATEGORIES.map(cat => (
                        <button
                          key={cat.slug}
                          onClick={() => setCategory(category === cat.slug ? null : cat.slug)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium transition-all",
                            category === cat.slug
                              ? "gradient-brand text-white"
                              : "border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CONDITIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => setCondition(condition === c ? null : c)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all",
                            condition === c
                              ? "gradient-brand text-white"
                              : "border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          )}
                        >
                          {c.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price range</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRICE_RANGES.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setPriceIdx(priceIdx === i ? null : i)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium transition-all",
                            priceIdx === i
                              ? "gradient-brand text-white"
                              : "border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <div className="mt-3 border-t border-white/5 pt-3">
                    <button
                      onClick={clearAll}
                      className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Active filters pills */}
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            {category && (
              <button
                onClick={() => setCategory(null)}
                className="flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300"
              >
                {MOCK_CATEGORIES.find(c => c.slug === category)?.name}
                <X className="h-3 w-3" />
              </button>
            )}
            {condition && (
              <button
                onClick={() => setCondition(null)}
                className="flex items-center gap-1 rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-0.5 text-xs text-pink-300 capitalize"
              >
                {condition.replace("_", " ")}
                <X className="h-3 w-3" />
              </button>
            )}
            {priceIdx !== null && (
              <button
                onClick={() => setPriceIdx(null)}
                className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300"
              >
                {PRICE_RANGES[priceIdx].label}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-4 text-lg font-semibold text-foreground">No results found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            <Button variant="outline" className="mt-6" onClick={clearAll}>Clear all filters</Button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
