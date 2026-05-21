"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Mock: Resend email — swap for real Supabase resetPasswordForEmail when configured
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
    toast.success("Reset email sent")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="glass-card rounded-3xl p-8 shadow-[0_32px_80px_oklch(0_0_0/0.5)]">
        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Reset your <GradientText>password</GradientText>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="gradient-brand btn-glow h-11 w-full gap-2 border-0 text-white hover:opacity-90"
              >
                {loading ? "Sending…" : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="text-center"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">Check your inbox</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We sent a password reset link to <strong className="text-foreground">{email}</strong>.
              It expires in 1 hour.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Didn&apos;t receive it?{" "}
              <button
                onClick={() => setSent(false)}
                className="text-violet-400 hover:text-violet-300"
              >
                Try again
              </button>
            </p>
          </motion.div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
