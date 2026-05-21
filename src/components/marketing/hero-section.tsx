"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, Shield, Star, TrendingUp, Zap, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"
import { HeroBlobBackground } from "@/components/brand/gradient-blob"
import { NoiseOverlay } from "@/components/brand/noise-overlay"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
}

const stats = [
  { label: "Verified items",  value: "2,400+", icon: Shield    },
  { label: "Trusted sellers", value: "180+",   icon: Star      },
  { label: "Total traded",    value: "$12M+",  icon: TrendingUp },
]

// Live price ticker — mock live data
const TICKER_ITEMS = [
  { id: "t1", title: "Patek Nautilus 5711",    price: "$87,500",  delta: "+2.4%", up: true  },
  { id: "t2", title: "Richard Mille RM 11-03", price: "$185,000", delta: "+0.9%", up: true  },
  { id: "t3", title: "Banksy Balloon Girl",    price: "$95,000",  delta: "-1.2%", up: false },
  { id: "t4", title: "KAWS SHARE Original",    price: "$285,000", delta: "+4.1%", up: true  },
  { id: "t5", title: "Hermès Birkin 30",       price: "$42,000",  delta: "+1.8%", up: true  },
]

function LiveTicker() {
  return (
    <div className="flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/3 px-4 py-2 backdrop-blur-sm">
      <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-amber-400">Live</span>
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 whitespace-nowrap"
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground">{item.title}</span>
              <span className="font-semibold text-foreground">{item.price}</span>
              <span className={`flex items-center gap-0.5 font-medium ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                {item.up ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {item.delta}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function ProductCardHero({
  title,
  price,
  tier,
  gradient,
  rotate,
  delay,
  zIndex,
  offset,
}: {
  title: string
  price: string
  tier: string
  gradient: string
  rotate: string
  delay: number
  zIndex: number
  offset?: { top?: string; right?: string; bottom?: string; left?: string }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: parseFloat(rotate) }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="animate-float glass-card absolute rounded-2xl p-px shadow-card-hover"
      style={{
        zIndex,
        ["--rotate" as string]: rotate,
        animationDelay: `${delay}s`,
        ...offset,
      }}
    >
      <div className="overflow-hidden rounded-[14px]">
        <div className={`h-44 w-64 ${gradient} relative flex items-end p-3`} aria-hidden="true">
          {/* Shimmer shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
          <div className="flex w-full items-center justify-between">
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
              {tier}
            </span>
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-300">Verified</span>
            </div>
          </div>
        </div>
        <div className="bg-midnight-50 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Ask price</span>
            <span className="text-sm font-bold text-foreground">{price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  const y       = useTransform(scrollYProgress, [0, 1], [0, -80])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section
      ref={containerRef}
      className="noise-overlay relative flex min-h-screen items-center overflow-hidden bg-midnight"
      aria-label="Hero"
    >
      <HeroBlobBackground />
      <NoiseOverlay />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-28"
      >
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* ── Left: Content ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start"
          >
            {/* Live ticker */}
            <motion.div variants={fadeUp} className="mb-6 w-full max-w-sm">
              <LiveTicker />
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeUp}>
              <Badge
                variant="outline"
                className="mb-6 gap-1.5 border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300"
              >
                <span className="text-violet-400">✦</span>
                Rarity, Authenticated
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-bold leading-[0.92] tracking-tighter text-foreground"
              style={{ fontSize: "clamp(3.75rem, 8vw, 8rem)" }}
            >
              Own
              <br />
              the{" "}
              <GradientText animated className="font-display font-bold leading-none">
                Rare.
              </GradientText>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Curated luxury watches, fine art, and exceptional collectibles — with
              provenance you can trust and authenticity you can verify.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="gradient-brand btn-glow h-12 gap-2 border-0 px-8 text-base font-semibold text-white transition-all hover:opacity-90"
                asChild
              >
                <Link href="/browse">
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/15 px-8 text-base backdrop-blur-sm hover:bg-white/5"
                asChild
              >
                <Link href="/#how-it-works">How it works</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-14 flex flex-wrap gap-8"
            >
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Product cards stack ── */}
          <div className="relative hidden h-[600px] lg:flex lg:items-center lg:justify-center">
            {/* Glow aura behind cards */}
            <div
              className="absolute inset-0 rounded-full bg-violet-500/8 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-pink-500/6 blur-3xl"
              aria-hidden="true"
            />

            {/* Main card — watch */}
            <div style={{ position: "absolute", top: "20%", left: "5%" }}>
              <ProductCardHero
                title="Patek Philippe Nautilus"
                price="$87,500"
                tier="Ultra Rare"
                gradient="bg-gradient-to-br from-violet-600/60 via-violet-900/80 to-midnight-100"
                rotate="-4deg"
                delay={0.3}
                zIndex={3}
              />
            </div>

            {/* Second card — art piece */}
            <div style={{ position: "absolute", top: "8%", right: "2%" }}>
              <ProductCardHero
                title="Banksy 'Girl with Balloon'"
                price="$95,000"
                tier="1 of 150"
                gradient="bg-gradient-to-br from-pink-600/60 via-pink-900/80 to-midnight-100"
                rotate="5deg"
                delay={0.5}
                zIndex={2}
              />
            </div>

            {/* Third card — designer */}
            <div style={{ position: "absolute", bottom: "12%", left: "10%" }}>
              <ProductCardHero
                title="Hermès Birkin 30 Bleu"
                price="$42,000"
                tier="Investment"
                gradient="bg-gradient-to-br from-amber-600/50 via-amber-900/70 to-midnight-100"
                rotate="3deg"
                delay={0.7}
                zIndex={1}
              />
            </div>

            {/* Floating verified badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="glass-card absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full px-4 py-2"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-foreground">Verified Authentic</span>
              {/* BLOCKCHAIN: This badge will show on-chain certificate hash in Phase 2.
                  The "Verified Authentic" state will be backed by authenticity_certificates
                  table (on-chain) rather than our off-chain verification flag. */}
            </motion.div>

            {/* Floating sale notification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="glass-card absolute bottom-24 right-4 z-10 flex items-center gap-2.5 rounded-2xl px-4 py-3"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">Just sold</p>
                <p className="text-[10px] text-muted-foreground">Rolex Daytona · $38,500</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
