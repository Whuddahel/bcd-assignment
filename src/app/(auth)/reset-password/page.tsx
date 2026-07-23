"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Lock, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientText } from "@/components/brand/gradient-text"
import { updatePassword } from "@/lib/auth/actions"
import { toast } from "sonner"

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

/**
 * Reached from a Supabase recovery email via /auth/confirm, which has already
 * exchanged the token for a session — so this page can simply update the user.
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await updatePassword(form)

      if (result.ok) {
        setDone(true)
        toast.success("Password updated")
        setTimeout(() => router.push("/account"), 1600)
        return
      }

      setError(result.error)
      setFieldErrors(result.fieldErrors ?? {})
      toast.error("Could not update password", { description: result.error })
    })
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass-card rounded-3xl p-10 text-center shadow-[0_32px_80px_oklch(0_0_0/0.5)]"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="font-display text-xl font-bold">Password updated</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Taking you to your account…
        </p>
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
            Choose a new <GradientText>password</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Make it at least 8 characters.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-muted-foreground">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={show ? "text" : "password"}
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
                onClick={() => setShow(v => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={show ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                className="h-11 border-white/10 bg-white/5 pl-9 focus-visible:ring-violet-500/50"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-400">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="gradient-brand btn-glow h-11 w-full gap-2 border-0 text-white hover:opacity-90"
          >
            {pending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
            ) : (
              <>Update password <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Link expired?{" "}
          <Link href="/forgot-password" className="font-medium text-violet-400 hover:text-violet-300">
            Request a new one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
