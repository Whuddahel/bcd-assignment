"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GradientText } from "@/components/brand/gradient-text"

const collections = [
  {
    id: "horology",
    title: "Fine Horology",
    subtitle: "Swiss masterpieces, pre-owned investment watches",
    itemCount: 340,
    tag: "Most sought-after",
    gradient: "from-violet-600/30 via-violet-900/20 to-midnight-100",
    accentColor: "bg-violet-500",
    href: "/browse?category=watches",
    items: [
      { name: "Nautilus 5711",    price: "$87,500" },
      { name: "Royal Oak 15500", price: "$62,000" },
      { name: "Daytona 116500",  price: "$44,000" },
    ],
  },
  {
    id: "art",
    title: "Contemporary Art",
    subtitle: "Prints, originals, and editions from iconic artists",
    itemCount: 210,
    tag: "New arrivals",
    gradient: "from-pink-600/30 via-pink-900/20 to-midnight-100",
    accentColor: "bg-pink-500",
    href: "/browse?category=art",
    items: [
      { name: "KAWS Companion",   price: "$18,500" },
      { name: "Banksy Print #12", price: "$24,000" },
      { name: "Murakami × LV",    price: "$9,800"  },
    ],
  },
  {
    id: "fashion",
    title: "Rare Fashion",
    subtitle: "Investment handbags, couture, and limited-edition pieces",
    itemCount: 175,
    tag: "High demand",
    gradient: "from-amber-600/30 via-amber-900/20 to-midnight-100",
    accentColor: "bg-amber-500",
    href: "/browse?category=designer",
    items: [
      { name: "Birkin 30 Gold",    price: "$42,000" },
      { name: "Chanel 22 Jumbo",   price: "$12,500" },
      { name: "LV Capucines BB",   price: "$8,900"  },
    ],
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export function FeaturedCollections() {
  return (
    <section className="bg-midnight py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
              ✦ Curated for collectors
            </p>
            <h2
              className="font-display font-bold leading-tight tracking-tighter text-foreground"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Featured{" "}
              <GradientText animated>Collections</GradientText>
            </h2>
          </div>
          <Link
            href="/browse"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all collections
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {collections.map((col) => (
            <motion.div key={col.id} variants={cardVariants}>
              <Link href={col.href} className="group block">
                <div className="glass-card overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  {/* Visual area */}
                  <div className={`relative h-52 bg-gradient-to-br ${col.gradient}`}>
                    {/* Abstract shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className={`absolute right-[-20%] top-[-20%] h-64 w-64 rounded-full ${col.accentColor}/10 blur-2xl`} />
                      <div className={`absolute bottom-[-10%] left-[-10%] h-48 w-48 rounded-full ${col.accentColor}/5 blur-xl`} />
                    </div>

                    {/* Tag */}
                    <Badge
                      variant="outline"
                      className="absolute left-4 top-4 border-white/10 bg-black/20 text-white/80 backdrop-blur-sm"
                    >
                      {col.tag}
                    </Badge>

                    {/* Item previews */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                      {col.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm"
                        >
                          <span className="text-xs font-medium text-white/90">{item.name}</span>
                          <span className="text-xs font-bold text-white">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {col.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{col.subtitle}</p>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-all group-hover:border-white/20 group-hover:text-foreground">
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground/60">
                      {col.itemCount.toLocaleString()} items available
                    </p>
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
