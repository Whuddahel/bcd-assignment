"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { signUpWithPassword } from "@/lib/auth/actions"
import { useMockAuth } from "@/lib/config"
import { toast } from "sonner"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ fullName: "", email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await signUpWithPassword(form)

      if (result.ok) {
        setSubmitted(true)
        return
      }

      setError(result.error)
      setFieldErrors(result.fieldErrors ?? {})
      toast.error("Could not create account", { description: result.error })
    })
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

        {useMockAuth && (
          <p className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
            Running without Supabase — sign-up is disabled. Add your project keys
            to <code className="font-mono">.env.local</code> to enable it.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        <OAuthButtons />

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1 bg-white/10" />
          <span className="text-xs text-muted-foreground">or sign up with email</span>
          <Separator className="flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs text-muted-foreground">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                placeholder="Your name"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                required
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.fullName)}
                className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-xs text-red-400">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.password)}
                className="h-11 border-white/10 bg-white/5 pl-9 pr-10 focus-visible:ring-violet-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="gradient-brand btn-glow h-11 w-full gap-2 border-0 text-white hover:opacity-90"
          >
            {pending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
            ) : (
              <>Create Account <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/legal/terms" className="text-violet-400 hover:text-violet-300">Terms</Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link>.
        </p>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </motion.div>
  )
}
