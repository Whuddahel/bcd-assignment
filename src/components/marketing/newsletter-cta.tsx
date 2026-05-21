"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradientBlob } from "@/components/brand/gradient-blob"
import { GradientText } from "@/components/brand/gradient-text"
import { NoiseOverlay } from "@/components/brand/noise-overlay"

export function NewsletterCTA() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <section className="relative overflow-hidden bg-midnight-50 py-24 sm:py-32">
      <NoiseOverlay />
      <GradientBlob color="violet" size="lg" className="-left-48 top-0" delay={0} />
      <GradientBlob color="pink"   size="md" className="-right-32 bottom-0" delay={6} />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-violet-400">
            ✦ Stay ahead of the market
          </p>
          <h2
            className="font-display font-bold leading-tight tracking-tighter"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Get{" "}
            <GradientText animated>Early Access</GradientText>
            <br />
            to Rare Drops
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
            Join 12,000+ collectors receiving curated drop alerts, market reports, and
            exclusive pre-sale access — before anyone else.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-10 flex max-w-sm items-center justify-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-6 py-4 text-green-400"
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You&rsquo;re on the list — we&rsquo;ll be in touch!</span>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 flex-1 rounded-xl border-white/10 bg-white/5 px-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-violet-500/50"
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                disabled={loading}
                className="gradient-brand btn-glow h-12 shrink-0 gap-2 border-0 px-6 font-semibold text-white transition-all hover:opacity-90"
              >
                {loading ? "Joining…" : "Join Waitlist"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground/60">
            No spam. Unsubscribe any time. We respect your inbox.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
