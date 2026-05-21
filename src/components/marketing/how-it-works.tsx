"use client"

import { motion } from "framer-motion"
import { Search, ShieldCheck, Wallet, ChevronRight } from "lucide-react"
import { GradientText } from "@/components/brand/gradient-text"
import { Badge } from "@/components/ui/badge"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover & Browse",
    description:
      "Explore thousands of curated luxury items from verified sellers worldwide. Filter by category, condition, rarity, and price.",
    color: "text-violet-400",
    glow: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Verify Authenticity",
    description:
      "Every item undergoes rigorous authentication. Sellers provide documentation; our experts verify provenance and condition.",
    color: "text-pink-400",
    glow: "bg-pink-500/10",
    border: "border-pink-500/20",
    blockchainNote: true,
  },
  {
    number: "03",
    icon: Wallet,
    title: "Buy with Confidence",
    description:
      "Secure checkout with Stripe. Your payment is held in escrow until you confirm receipt. Full buyer protection on every transaction.",
    color: "text-amber-400",
    glow: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-midnight py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-400">
            ✦ The Aureon way
          </p>
          <h2
            className="font-display font-bold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            How{" "}
            <GradientText animated>It Works</GradientText>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From discovery to delivery — every step is designed for the discerning collector.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line */}
          <div
            className="absolute left-1/2 top-16 hidden h-[calc(100%-8rem)] w-px -translate-x-1/2 bg-gradient-to-b from-violet-500/30 via-pink-500/30 to-amber-500/30 lg:block"
            aria-hidden="true"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Number */}
                  <span className="mb-5 font-display text-7xl font-bold leading-none text-white/5 select-none">
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    className={`relative -mt-14 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${step.border} ${step.glow}`}
                  >
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <div className="glass-card max-w-xs rounded-2xl p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    {step.blockchainNote && (
                      <div className="mt-4 border-t border-white/5 pt-4">
                        {/* BLOCKCHAIN: In Phase 2, this section will display the on-chain
                            provenance_record hash and a link to view the full ownership
                            chain on-chain. Replace this badge with the BlockchainProvenanceCard
                            component once smart contracts are deployed. */}
                        <Badge
                          variant="outline"
                          className="gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-300"
                        >
                          <span className="text-violet-400">⬡</span>
                          Powered by blockchain — coming soon
                        </Badge>
                        <p className="mt-2 text-xs text-muted-foreground/60">
                          On-chain provenance certificates launching in Phase 2
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arrow between steps */}
                  {i < steps.length - 1 && (
                    <ChevronRight
                      className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-muted-foreground/20 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
