"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/** Seller-facing action to move a confirmed order to "shipped". */
export function MarkShippedButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markShipped() {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "shipped" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not update this order.")
      toast.success("Marked as shipped", { description: "The buyer has been notified." })
      router.refresh()
    } catch (e) {
      toast.error("Update failed", { description: e instanceof Error ? e.message : undefined })
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1.5 border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 text-xs"
      onClick={markShipped}
      disabled={loading}
    >
      <Truck className="h-3 w-3" /> {loading ? "Updating…" : "Mark as shipped"}
    </Button>
  )
}
