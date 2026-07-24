"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConnectPayoutsButton({
  label = "Set up payouts",
}: {
  label?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startOnboarding() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/seller/connect", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not start onboarding.")
      // Hand off to Stripe's hosted onboarding.
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start onboarding.")
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={startOnboarding}
        disabled={loading}
        className="gradient-brand btn-glow gap-2 border-0 text-white hover:opacity-90"
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            />
            Redirecting to Stripe…
          </>
        ) : (
          <>
            {label} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
