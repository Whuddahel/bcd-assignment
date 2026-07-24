"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Package, ArrowRight, Shield, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { HeroBlobBackground } from "@/components/brand/gradient-blob"
import { formatPrice } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const STEPS = [
  { icon: Shield,        label: "Seller notified",       sub: "Seller has 48h to confirm",  done: true  },
  { icon: Package,       label: "Authentication check",   sub: "Item inspected on dispatch",  done: false },
  { icon: CheckCircle,   label: "Insured shipping",       sub: "Full-coverage tracked shipping", done: false },
  { icon: Star,          label: "Delivered to you",       sub: "Add to your Collection",      done: false },
]

type OrderItem = { id: string; product_id: string; title: string; price: number; quantity: number }
type Order = {
  id: string
  status: string
  total_amount: number
  platform_fee: number
  created_at: string
  items: OrderItem[]
}

const POLL_ATTEMPTS = 6
const POLL_INTERVAL_MS = 1500

function useRealOrder(paymentIntentId: string | null) {
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not_found" | "unavailable">(
    paymentIntentId ? "loading" : "idle",
  )

  useEffect(() => {
    if (!paymentIntentId) return
    let cancelled = false

    async function poll() {
      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
        if (cancelled) return
        try {
          const res = await fetch(`/api/orders/by-payment-intent/${paymentIntentId}`)
          if (res.status === 503) {
            if (!cancelled) setStatus("unavailable")
            return
          }
          if (res.ok) {
            const data = await res.json()
            if (data.order) {
              if (!cancelled) {
                setOrder(data.order)
                setStatus("found")
              }
              return
            }
          }
        } catch {
          // network hiccup — fall through and retry
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      }
      if (!cancelled) setStatus("not_found")
    }

    poll()
    return () => {
      cancelled = true
    }
  }, [paymentIntentId])

  return { order, status }
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get("payment_intent")
  const { order, status } = useRealOrder(paymentIntentId)

  const showRealOrder = status === "found" && order
  const showConfirming = paymentIntentId && status === "loading"

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
            {showConfirming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 rounded-full border-2 border-violet-500/30 border-t-violet-400"
              />
            ) : (
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            )}
          </motion.div>
          {!showConfirming && (
            <>
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-violet-500/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.2, repeat: Infinity, repeatDelay: 1 }}
                />
              ))}
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
        >
          {showConfirming ? (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
                Confirming your order
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Almost there…
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
                Your payment went through — we&apos;re just finalizing the order record.
              </p>
            </>
          ) : (
            <>
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
            </>
          )}
        </motion.div>

        {status === "not_found" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-6 flex max-w-sm items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-left text-xs text-amber-400"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your payment succeeded, but we&apos;re still waiting on the order record — check{" "}
            <Link href="/account/orders" className="underline">
              My Orders
            </Link>{" "}
            in a moment.
          </motion.div>
        )}

        {/* Order reference */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          className="glass-card mx-auto mt-8 rounded-2xl p-5 text-left"
        >
          {showRealOrder ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Order reference</p>
                  <p className="font-mono text-sm font-bold text-foreground uppercase">
                    #{order.id.slice(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">
                    {formatPrice((order.total_amount) / 100)}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-foreground">{formatPrice((item.price * item.quantity) / 100)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Order reference</p>
                <p className="font-mono text-lg font-bold text-foreground uppercase">
                  {showConfirming ? "…" : "#ORD-2024-8841"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Estimated delivery</p>
                <p className="font-semibold text-foreground">5–7 business days</p>
              </div>
            </div>
          )}
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
            {STEPS.map(({ icon: Icon, label, sub, done }) => (
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-midnight" />}>
      <SuccessContent />
    </Suspense>
  )
}
