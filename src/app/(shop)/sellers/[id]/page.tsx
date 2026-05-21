"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, CheckCircle, Package, Shield, ArrowLeft, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { ProductCard } from "@/components/shop/product-card"
import { MOCK_SELLERS, MOCK_PRODUCTS } from "@/lib/mock"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const seller = MOCK_SELLERS.find((s) => s.id === id) ?? notFound()
  const listings = MOCK_PRODUCTS.filter((p) => p.sellerId === seller.id && p.status === "active")

  return (
    <div className="min-h-screen bg-midnight">
      {/* Back */}
      <div className="border-b border-white/5 bg-midnight-50/30 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/sellers"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All sellers
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10 flex flex-wrap items-start gap-6"
        >
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl gradient-brand text-4xl font-bold text-white shadow-lg">
            {seller.businessName.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground">
                {seller.businessName}
              </h1>
              {seller.verified ? (
                <Badge className="gap-1.5 bg-violet-500/20 text-violet-300 border-violet-500/30">
                  <CheckCircle className="h-3 w-3" /> Verified Seller
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/10 text-muted-foreground">
                  Pending verification
                </Badge>
              )}
            </div>

            <p className="mt-1 text-sm font-medium text-violet-400">{seller.specialty}</p>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
              {seller.description}
            </p>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-foreground">{seller.rating.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">({seller.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{seller.totalSales} sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{listings.length} active listings</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="outline"
            className="shrink-0 gap-2 border-white/10 hover:bg-white/5"
          >
            <MessageSquare className="h-4 w-4" />
            Contact seller
          </Button>
        </motion.div>

        {/* Listings */}
        <div>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">
              <GradientText>{listings.length} Active Listings</GradientText>
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">No active listings</p>
              <p className="mt-1 text-sm text-muted-foreground">This seller has no items listed right now.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
