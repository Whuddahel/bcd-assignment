"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Shield, ExternalLink, ArrowRight, Clock, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_PRODUCTS } from "@/lib/mock"
import { formatPrice, cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

// Mock: items the user "owns" after delivery
const COLLECTION_ITEMS = MOCK_PRODUCTS.filter((p) =>
  ["p11", "p20", "p21"].includes(p.id),
).map((p) => ({
  ...p,
  purchasedDate: "2024-11-15",
  purchasePrice: p.price,
  currentValue:  Math.round(p.price * 1.08 + Math.random() * p.price * 0.05),
}))

const totalValue   = COLLECTION_ITEMS.reduce((s, p) => s + p.currentValue, 0)
const totalPaid    = COLLECTION_ITEMS.reduce((s, p) => s + p.purchasePrice, 0)
const appreciation = totalValue - totalPaid

export default function CollectionPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          My <GradientText>Collection</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your authenticated collectibles — blockchain provenance coming in Phase 2.
        </p>
      </div>

      {/* Portfolio stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total items",    value: COLLECTION_ITEMS.length, color: "text-violet-400",  sub: "In your collection" },
          { label: "Portfolio value",value: formatPrice(totalValue), color: "text-amber-400",   sub: "Current market est." },
          { label: "Appreciation",   value: `+${formatPrice(appreciation)}`, color: "text-emerald-400", sub: `vs. ${formatPrice(totalPaid)} paid` },
        ].map(({ label, value, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
            className="glass-card rounded-2xl p-5"
          >
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Blockchain teaser banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: EASE }}
        className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-pink-500/5 to-amber-500/5 p-5"
      >
        {/* BLOCKCHAIN: Phase 2 — this entire panel will be replaced with on-chain certificate viewer.
            Each owned item will have provenance_records + authenticity_certificates from the blockchain.
            The "View certificate" links will resolve to on-chain tx hashes. */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20">
            <Shield className="h-6 w-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">Blockchain Provenance</h3>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px]">
                Phase 2 — Coming soon
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Every item in your collection will have an immutable on-chain authenticity
              certificate and full ownership transfer history — so you can prove provenance
              forever, not just while you hold the receipt.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Collection items */}
      {COLLECTION_ITEMS.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">Your collection is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Items appear here after they are delivered.
          </p>
          <Button className="gradient-brand mt-6 border-0 text-white" asChild>
            <Link href="/browse">Discover collectibles</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {COLLECTION_ITEMS.map((item, i) => {
            const gain = item.currentValue - item.purchasePrice
            const gainPct = ((gain / item.purchasePrice) * 100).toFixed(1)
            const isUp = gain >= 0

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: EASE }}
              >
                <div className="glass-card overflow-hidden rounded-2xl">
                  <div className="flex flex-wrap items-center gap-4 p-5">
                    {/* Thumbnail */}
                    <div className={cn("h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br", item.gradient)} />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
                          <Shield className="mr-1 h-2.5 w-2.5" />
                          Verified
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.sellerName} · Purchased {item.purchasedDate}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Authenticity certificate verified (off-chain)
                        {/* BLOCKCHAIN: Replace with on-chain cert link in Phase 2 */}
                      </div>
                    </div>

                    {/* Value */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">Estimated value</p>
                      <p className="text-lg font-bold text-foreground">{formatPrice(item.currentValue)}</p>
                      <p className={cn("text-xs font-medium", isUp ? "text-emerald-400" : "text-red-400")}>
                        {isUp ? "+" : ""}{formatPrice(gain)} ({gainPct}%)
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 gap-1" asChild>
                        <Link href={`/product/${item.slug}`}>
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Blockchain placeholder bar */}
                  {/* BLOCKCHAIN: this bottom bar will show the on-chain cert hash + "View on chain" link */}
                  <div className="border-t border-white/5 bg-white/1 px-5 py-2.5">
                    <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Shield className="h-3 w-3 text-violet-400/50" />
                      Blockchain certificate:
                      <span className="text-violet-400/50">Phase 2 — Not yet minted</span>
                      <span className="ml-auto flex items-center gap-1 text-violet-400/50">
                        Learn more <ArrowRight className="h-3 w-3" />
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
