"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowRight, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatPrice, cn } from "@/lib/utils"

type SearchProduct = {
  id: string
  slug: string
  title: string
  sellerName: string
  gradient: string
  price: number
}
type SearchCategory = { name: string; slug: string }
type BrowseCategory = { name: string; slug: string; count: number }

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [catResults, setCatResults] = useState<SearchCategory[]>([])
  const [categories, setCategories] = useState<BrowseCategory[]>([])
  const [trending, setTrending] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load the category grid once the modal opens.
  useEffect(() => {
    if (!isOpen || categories.length > 0) return
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [isOpen, categories.length])

  // Load trending products once the modal opens. /api/search returns trending
  // products when called with no query — see the empty-q branch there.
  useEffect(() => {
    if (!isOpen || trending.length > 0) return
    fetch("/api/search")
      .then((r) => r.json())
      .then((d) => setTrending(d.products ?? []))
      .catch(() => {})
  }, [isOpen, trending.length])

  // Debounced product/category search.
  useEffect(() => {
    const q = query.trim()
    if (q.length === 0) {
      setResults([])
      setCatResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setResults(d.products ?? [])
          setCatResults(d.categories ?? [])
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 220)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery("")
    }
  }, [isOpen])

  // ⌘K itself is handled by the header (it owns the open/closed toggle).
  // This modal only needs to close itself on Escape.
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="relative flex min-h-screen items-start justify-center px-4 pt-16 sm:pt-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card w-full max-w-2xl overflow-hidden rounded-2xl shadow-[0_32px_80px_oklch(0_0_0/0.6)]"
            >
              {/* Input */}
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-violet-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search watches, art, designer, rare items…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4">
                {query.trim() === "" ? (
                  /* Default state */
                  <div className="space-y-5">
                    {/* Trending */}
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
                        Trending
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trending.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setQuery(p.title)}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Browse categories */}
                    <div>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Browse by category
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {categories.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/browse?category=${c.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/2 p-3 text-sm text-muted-foreground transition-colors hover:border-violet-500/20 hover:bg-violet-500/5 hover:text-foreground"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{c.count}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Search results */
                  <div className="space-y-1">
                    {loading ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                      </div>
                    ) : results.length === 0 && catResults.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                          No results for &ldquo;<span className="text-foreground">{query}</span>&rdquo;
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
                      </div>
                    ) : (
                      <>
                        {catResults.length > 0 && (
                          <div className="mb-3">
                            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Categories
                            </p>
                            {catResults.map((c) => (
                              <Link
                                key={c.slug}
                                href={`/browse?category=${c.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                              >
                                <span className="font-medium text-violet-400">{c.name}</span>
                                <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        )}
                        {results.length > 0 && (
                          <div>
                            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Items
                            </p>
                            {results.map((p) => (
                              <Link
                                key={p.id}
                                href={`/product/${p.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                              >
                                <div
                                  className={cn(
                                    "h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br",
                                    p.gradient,
                                  )}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                                  <p className="text-xs text-muted-foreground">{p.sellerName}</p>
                                </div>
                                <p className="shrink-0 text-sm font-bold text-foreground">
                                  {formatPrice(p.price)}
                                </p>
                              </Link>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 border-t border-white/5 pt-2">
                          <Link
                            href={`/browse?q=${encodeURIComponent(query)}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-violet-400 transition-colors hover:text-violet-300"
                          >
                            View all results for &ldquo;{query}&rdquo;
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="border-t border-white/5 px-4 py-2.5 text-[10px] text-muted-foreground flex items-center gap-3">
                <span><kbd className="rounded border border-white/10 px-1.5 py-0.5 font-sans">↑↓</kbd> navigate</span>
                <span><kbd className="rounded border border-white/10 px-1.5 py-0.5 font-sans">↵</kbd> select</span>
                <span><kbd className="rounded border border-white/10 px-1.5 py-0.5 font-sans">ESC</kbd> close</span>
                <span className="ml-auto">⌘K to open anytime</span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
