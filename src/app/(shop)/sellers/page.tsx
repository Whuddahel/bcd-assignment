"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Star, CheckCircle, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { MOCK_SELLERS } from "@/lib/mock"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <div className="border-b border-white/5 bg-midnight-50/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
              ✦ Verified specialists
            </p>
            <h1
              className="font-display font-bold tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Meet Our <GradientText animated>Sellers</GradientText>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Every seller on Aureon is vetted for authenticity, expertise, and reliability. Browse by specialty and discover the best in every category.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SELLERS.map((seller, i) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            >
              <Link href={`/sellers/${seller.id}`} className="group block h-full">
                <div className="glass-card flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_oklch(0_0_0/0.5)]">
                  {/* Avatar */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-2xl font-bold text-white shadow-lg">
                      {seller.businessName.charAt(0)}
                    </div>
                    {seller.verified ? (
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 gap-1">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-white/10 text-muted-foreground text-[10px]">
                        Pending
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-foreground">{seller.businessName}</h2>
                  <p className="mt-1 text-xs text-violet-400 font-medium">{seller.specialty}</p>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {seller.description}
                  </p>

                  {/* Stats */}
                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-sm font-bold">{seller.rating.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Rating</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                      <p className="text-sm font-bold text-foreground">{seller.reviewCount}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-0.5 text-foreground">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-bold">{seller.totalSales}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Sales</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
