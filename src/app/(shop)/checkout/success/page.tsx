"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Package, ArrowRight, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { HeroBlobBackground } from "@/components/brand/gradient-blob"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const steps = [
  { icon: Shield,        label: "Seller notified",       sub: "Seller has 48h to confirm",  done: true  },
  { icon: Package,       label: "Authentication check",   sub: "Item inspected on dispatch",  done: false },
  { icon: CheckCircle,   label: "Insured shipping",       sub: "Full-coverage tracked shipping", done: false },
  { icon: Star,          label: "Delivered to you",       sub: "Add to your Collection",      done: false },
]

export default function CheckoutSuccessPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-midnight px-4 py-24">
      <HeroBlobBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 mx-auto w-full max-w-lg text-center"
      >
        {/* Success ring animation */}
        <div className="relative mx-auto mb-8 h-24 w-24">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className="absolute inset-0 rounded-full gradient-brand"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: EASE }}
            className="absolute inset-2 flex items-center justify-center rounded-full bg-midnight"
          >
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </motion.div>
          {/* Pulse rings */}
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-violet-500/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.2, repeat: Infinity, repeatDelay: 1 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            ✦ Order confirmed
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            You own <GradientText animated>the Rare</GradientText>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Congratulations! Your order has been placed and the seller has been notified.
            You&apos;ll receive a confirmation email shortly.
          </p>
        </motion.div>

        {/* Order reference */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          className="glass-card mx-auto mt-8 rounded-2xl p-5 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Order reference</p>
              <p className="font-mono text-lg font-bold text-foreground uppercase">#ORD-2024-8841</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Estimated delivery</p>
              <p className="font-semibold text-foreground">5–7 business days</p>
            </div>
          </div>
        </motion.div>

        {/* Progress steps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
          className="glass-card mt-6 rounded-2xl p-5"
        >
          <h3 className="mb-4 text-left text-sm font-semibold text-foreground">What happens next</h3>
          <div className="space-y-3">
            {steps.map(({ icon: Icon, label, sub, done }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? "gradient-brand" : "border border-white/10 bg-white/3"}`}>
                  <Icon className={`h-4 w-4 ${done ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                {done && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
            asChild
          >
            <Link href="/account/orders">
              View my orders <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5"
            asChild
          >
            <Link href="/browse">Continue shopping</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
