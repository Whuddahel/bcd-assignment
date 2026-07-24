"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function RefundButton({
  orderId,
  disabled = false,
}: {
  orderId: string
  disabled?: boolean
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function refund() {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Refund failed.")
      toast.success("Refund issued", { description: "The buyer will be refunded to their original payment method." })
      router.refresh()
    } catch (e) {
      toast.error("Refund failed", { description: e instanceof Error ? e.message : undefined })
      setLoading(false)
      setConfirming(false)
    }
  }

  if (disabled) {
    return (
      <Button size="sm" variant="outline" disabled className="h-7 gap-1.5 border-white/10 text-xs">
        <RotateCcw className="h-3 w-3" /> Refunded
      </Button>
    )
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          className="h-7 gap-1.5 border-0 bg-red-500/90 text-white text-xs hover:bg-red-500"
          onClick={refund}
          disabled={loading}
        >
          <AlertCircle className="h-3 w-3" />
          {loading ? "Refunding…" : "Confirm refund"}
        </Button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1.5 border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs"
      onClick={() => setConfirming(true)}
    >
      <RotateCcw className="h-3 w-3" /> Refund
    </Button>
  )
}
