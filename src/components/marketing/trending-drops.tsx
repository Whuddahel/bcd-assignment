"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Heart, Shield, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { formatPrice } from "@/lib/utils"
import { MOCK_PRODUCTS } from "@/lib/mock"
import { useCartStore } from "@/stores/cart-store"
import { toast } from "sonner"
import { useRef } from "react"

// Use the real isTrending products so hrefs always match real slugs
const drops = MOCK_PRODUCTS.filter((p) => p.isTrending && p.status === "active").slice(0, 4)

const conditionLabel: Record<string, string> = {
  mint:      "Mint",
  excellent: "Excellent",
  very_good: "Very Good",
  good:      "Good",
  fair:      "Fair",
}

const conditionColor: Record<string, string> = {
  mint:      "text-emerald-400",
  excellent: "text-green-400",
  very_good: "text-lime-400",
  good:      "text-yellow-400",
  fair:      "text-orange-400",
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  function onMouseLeave() { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function DropCard({ drop, index }: { drop: typeof drops[0]; index: number }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  return (
    <TiltCard>
      <Link href={`/product/${drop.slug}`} className="group block">
        <div className="glass-card overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-card-hover">
          {/* Image area */}
          <div className={`relative h-52 bg-gradient-to-br ${drop.gradient}`}>
            {!imgError && drop.images[0] && (
              <Image
                src={drop.images[0]}
                alt={drop.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover opacity-75 transition-transform duration-700 group-hover:scale-105"
                priority={index < 2}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgOCA4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMyMDE0MzAiLz48L3N2Zz4="
                onError={() => setImgError(true)}
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badge */}
            {drop.badge && (
              <div className="absolute left-3 top-3 z-10">
                <span className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {drop.badge}
                </span>
              </div>
            )}

            {/* Wishlist */}
            <button
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                wishlisted ? "bg-pink-500/90 text-white" : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setWishlisted((w) => !w)
                toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist", { description: drop.title })
              }}
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-current" : ""}`} />
            </button>

            {/* Rarity */}
            {drop.rarity && (
              <div className="absolute bottom-3 left-3 z-10">
                <Badge variant="outline" className="border-white/20 bg-black/30 text-white/80 backdrop-blur-sm text-[10px]">
                  {drop.rarity}
                </Badge>
              </div>
            )}

            {/* Quick add */}
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-violet-500/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-all hover:bg-violet-500 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addItem(drop)
                toast.success("Added to cart", { description: drop.title })
              }}
            >
              + Add to cart
            </motion.button>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-[11px] text-muted-foreground mb-0.5">{drop.sellerName}</p>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-violet-300">
              {drop.title}
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ask price</p>
                <p className="text-lg font-bold text-foreground">{formatPrice(drop.price)}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${conditionColor[drop.condition] ?? "text-muted-foreground"}`}>
                <Shield className="h-3 w-3" />
                {conditionLabel[drop.condition] ?? drop.condition}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}

export function TrendingDrops() {
  return (
    <section className="relative bg-midnight-50/30 py-24 sm:py-32">
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-pink-400">
              ✦ Dropping now
            </p>
            <h2
              className="font-display font-bold leading-tight tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Trending <GradientText animated>Drops</GradientText>
            </h2>
          </div>
          <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" asChild>
            <Link href="/browse?sort=trending">
              See all drops <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {drops.map((drop, i) => (
            <motion.div
              key={drop.id}
              variants={{
                hidden: { opacity: 0, y: 32 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
              }}
            >
              <DropCard drop={drop} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
