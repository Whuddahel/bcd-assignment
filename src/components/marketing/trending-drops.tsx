"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { Heart, Shield, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { formatPrice } from "@/lib/utils"
import { useRef } from "react"

const drops = [
  {
    id: "1",
    title: "Patek Philippe Nautilus 5711/1A",
    seller: "WatchVault Geneva",
    price: 87500,
    condition: "Excellent",
    rarity: "Ultra Rare",
    gradient: "from-violet-600/50 to-violet-900/80",
    badge: "🔥 Hot",
    href: "/product/nautilus-5711",
  },
  {
    id: "2",
    title: "Audemars Piguet Royal Oak 15500",
    seller: "Prestige Horology",
    price: 62000,
    condition: "Mint",
    rarity: "Rare",
    gradient: "from-pink-600/50 to-pink-900/80",
    badge: "⚡ New",
    href: "/product/royal-oak-15500",
  },
  {
    id: "3",
    title: "KAWS BFF Plush (Limited Ed.)",
    seller: "ArtHouse Collective",
    price: 18500,
    condition: "Sealed",
    rarity: "1 of 500",
    gradient: "from-amber-600/50 to-amber-900/80",
    badge: "✦ Featured",
    href: "/product/kaws-bff",
  },
  {
    id: "4",
    title: "Hermès Birkin 30 Vert Veronese",
    seller: "Maison Resell",
    price: 42000,
    condition: "Very Good",
    rarity: "Investment",
    gradient: "from-emerald-600/50 to-emerald-900/80",
    badge: "↑ Rising",
    href: "/product/birkin-30",
  },
]

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

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

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
              Trending{" "}
              <GradientText animated>Drops</GradientText>
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
          {drops.map((drop) => (
            <motion.div
              key={drop.id}
              variants={{
                hidden: { opacity: 0, y: 32 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
              }}
            >
              <TiltCard>
                <Link href={drop.href} className="group block">
                  <div className="glass-card overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-card-hover">
                    {/* Image area */}
                    <div className={`relative h-48 bg-gradient-to-br ${drop.gradient}`}>
                      {/* Badge */}
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {drop.badge}
                        </span>
                      </div>
                      {/* Wishlist */}
                      <button
                        aria-label={`Add ${drop.title} to wishlist`}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>

                      {/* Rarity tag */}
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="outline"
                          className="border-white/20 bg-black/30 text-white/80 backdrop-blur-sm"
                        >
                          {drop.rarity}
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {drop.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">{drop.seller}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Ask price
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {formatPrice(drop.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <Shield className="h-3 w-3" />
                          {drop.condition}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
