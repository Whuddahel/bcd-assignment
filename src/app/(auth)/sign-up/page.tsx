"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { toast } from "sonner"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [form, setForm]        = useState({ name: "", email: "", password: "" })
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  function handleOAuth(provider: string) {
    toast.info(`${provider} OAuth`, { description: "Configure Supabase OAuth to enable this." })
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass-card rounded-3xl p-10 text-center shadow-[0_32px_80px_oklch(0_0_0/0.5)]"
      >
        <div className="mb-4 text-5xl">✉️</div>
        <h2 className="font-display text-2xl font-bold">Check your email</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We sent a verification link to <strong className="text-foreground">{form.email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/sign-in">
          <Button variant="outline" className="mt-8 border-white/10">Back to Sign In</Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="glass-card rounded-3xl p-8 shadow-[0_32px_80px_oklch(0_0_0/0.5)]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Join <GradientText animated>Aureon</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Create your collector account — free forever</p>
        </div>

        {/* OAuth */}
        <div className="space-y-2.5">
          {[
            {
              label: "Continue with Google",
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              ),
              provider: "Google",
            },
            {
              label: "Continue with Apple",
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.83 0-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.21 1.8 2.58 3.12 2.53 1.22-.05 1.69-.8 3.17-.8 1.48 0 1.9.8 3.19.77 1.35-.03 2.2-1.24 3.02-2.45a11 11 0 0 0 1.38-2.85 4.41 4.41 0 0 1-2.42-4.04z"/>
                </svg>
              ),
              provider: "Apple",
            },
          ].map(({ label, icon, provider }) => (
            <button
              key={provider}
              type="button"
              onClick={() => handleOAuth(provider)}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-foreground transition-all hover:bg-white/10 hover:border-white/20"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1 bg-white/10" />
          <span className="text-xs text-muted-foreground">or sign up with email</span>
          <Separator className="flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-muted-foreground">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                autoComplete="name"
                className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
                className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 border-white/10 bg-white/5 pl-9 pr-10 focus-visible:ring-violet-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="gradient-brand btn-glow h-11 w-full gap-2 border-0 text-white hover:opacity-90"
          >
            {loading ? "Creating account…" : <>Create Account <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="#" className="text-violet-400 hover:text-violet-300">Terms</Link>{" "}
          and{" "}
          <Link href="#" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>.
        </p>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </motion.div>
  )
}
