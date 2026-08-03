"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAttest } from "@/lib/blockchain/hooks/useAttest"
import { toast } from "sonner"

/**
 * Admin "Attest Authenticity" control for the product moderation table. Only
 * usable once a product has been minted. Signing happens server-side.
 */
export function AttestButton({
  productId,
  minted,
  attested: initialAttested,
}: {
  productId: string
  minted: boolean
  attested?: boolean
}) {
  const router = useRouter()
  const { attest, pending } = useAttest()
  const [attested, setAttested] = useState(Boolean(initialAttested))

  if (attested) {
    return (
      <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-300">
        <BadgeCheck className="h-3 w-3" /> Attested
      </Badge>
    )
  }

  if (!minted) {
    return (
      <Badge className="border-white/10 bg-white/5 text-[10px] text-muted-foreground">
        Not minted
      </Badge>
    )
  }

  async function handleAttest() {
    const res = await attest(productId)
    if (res.ok) {
      setAttested(true)
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleAttest}
      disabled={pending}
      className="h-8 gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Attesting…
        </>
      ) : (
        <>
          <ShieldCheck className="h-3.5 w-3.5" /> Attest
        </>
      )}
    </Button>
  )
}
