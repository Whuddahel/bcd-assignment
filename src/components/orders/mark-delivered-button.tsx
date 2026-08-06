"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/** Buyer-facing confirmation that an order has arrived. */
export function MarkDeliveredButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markDelivered() {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not update this order.")
      toast.success("Marked as delivered", { description: "This item now shows in your collection." })
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
      className="h-7 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs"
      onClick={markDelivered}
      disabled={loading}
    >
      <PackageCheck className="h-3 w-3" /> {loading ? "Confirming…" : "Mark as delivered"}
    </Button>
  )
}
