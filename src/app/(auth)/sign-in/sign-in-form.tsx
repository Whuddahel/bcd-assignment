"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { signInWithPassword } from "@/lib/auth/actions"
import { useMockAuth } from "@/lib/config"
import { toast } from "sonner"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function SignInForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? undefined

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  // Seeded from ?error= so failures bounced back by /auth/callback show up on
  // first paint, then owned by the form for subsequent attempts.
  const [error, setError] = useState<string | null>(() => searchParams.get("error"))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    startTransition(async () => {
      // On success the action redirects and never resolves here.
      const result = await signInWithPassword(form, next)
      if (result?.ok === false) {
        setError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        toast.error("Could not sign in", { description: result.error })
      }
    })
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
            Welcome <GradientText>back</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your Aureon account</p>
        </div>

        {useMockAuth && (
          <p className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
            Running without Supabase — sign-in is disabled. Add your project keys
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

        <OAuthButtons next={next} />

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1 bg-white/10" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
              <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
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
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <>Sign In <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-violet-400 hover:text-violet-300">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
