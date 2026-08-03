"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMint } from "@/lib/blockchain/hooks/useMint"
import { toast } from "sonner"

/**
 * Seller "Mint Digital Twin" control. Appears on a published product. Once minted
 * it shows the token id. Signing happens server-side (operator key).
 */
export function MintButton({
  productId,
  tokenId: initialTokenId,
  compact = false,
}: {
  productId: string
  tokenId?: string | null
  compact?: boolean
}) {
  const router = useRouter()
  const { mint, pending } = useMint()
  const [tokenId, setTokenId] = useState<string | null>(initialTokenId ?? null)

  async function handleMint() {
    const res = await mint(productId)
    if (res.ok) {
      setTokenId(res.tokenId)
      toast.success(res.message)
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  if (tokenId) {
    return (
      <Badge
        className={
          "gap-1 border-violet-500/30 bg-violet-500/15 text-violet-200 " +
          (compact ? "text-[10px]" : "text-xs")
        }
      >
        <BadgeCheck className="h-3 w-3" /> Token #{tokenId}
      </Badge>
    )
  }

  return (
    <Button
      type="button"
      size={compact ? "sm" : "default"}
      onClick={handleMint}
      disabled={pending}
      className="gradient-brand gap-2 border-0 text-white hover:opacity-90"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Minting…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" /> Mint Digital Twin
        </>
      )}
    </Button>
  )
}
