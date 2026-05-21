"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { GradientText } from "@/components/brand/gradient-text"

const categories = [
  {
    slug: "watches",
    name: "Watches",
    count: "340+",
    description: "Swiss movements, investment dials",
    gradient: "from-violet-500/20 to-violet-900/10",
    emoji: "⌚",
    href: "/browse?category=watches",
    span: "lg:col-span-2",
  },
  {
    slug: "art",
    name: "Fine Art",
    count: "210+",
    description: "Contemporary prints & originals",
    gradient: "from-pink-500/20 to-pink-900/10",
    emoji: "🖼",
    href: "/browse?category=art",
    span: "",
  },
  {
    slug: "designer",
    name: "Designer",
    count: "175+",
    description: "Handbags, RTW, accessories",
    gradient: "from-amber-500/20 to-amber-900/10",
    emoji: "👜",
    href: "/browse?category=designer",
    span: "",
  },
  {
    slug: "rare",
    name: "Rare Collectibles",
    count: "95+",
    description: "One-of-a-kind museum-quality pieces",
    gradient: "from-emerald-500/20 to-emerald-900/10",
    emoji: "💎",
    href: "/browse?category=rare",
    span: "",
  },
  {
    slug: "jewelry",
    name: "Fine Jewelry",
    count: "130+",
    description: "Diamonds, sapphires, estate pieces",
    gradient: "from-sky-500/20 to-sky-900/10",
    emoji: "💍",
    href: "/browse?category=jewelry",
    span: "lg:col-span-2",
  },
]

export function CategoryShowcase() {
  return (
    <section className="bg-midnight-50/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            ✦ Shop by category
          </p>
          <h2
            className="font-display font-bold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Every{" "}
            <GradientText animated>Category,</GradientText>
            <br />
            Curated to Perfection
          </h2>
        </motion.div>

        {/* Asymmetric grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.slug}
              variants={{
                hidden: { opacity: 0, scale: 0.96 },
                show:   { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
              }}
              className={cat.span}
            >
              <Link href={cat.href} className="group block h-full">
                <div
                  className={`glass-card flex h-full min-h-[160px] flex-col justify-between rounded-2xl bg-gradient-to-br ${cat.gradient} p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-4xl">{cat.emoji}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all group-hover:border-white/25 group-hover:text-foreground">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">{cat.count}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
