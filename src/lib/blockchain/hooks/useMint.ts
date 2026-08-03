"use client"

import { useState } from "react"
import { mintDigitalTwinAction } from "@/lib/actions/blockchain"

/**
 * Seller action: mint the digital twin for a product. The signing happens on the
 * server (operator key); this hook only tracks pending/result state.
 */
export function useMint() {
  const [pending, setPending] = useState(false)
  const [tokenId, setTokenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function mint(productId: string) {
    setPending(true)
    setError(null)
    try {
      const res = await mintDigitalTwinAction(productId)
      if (res.ok) {
        setTokenId(res.tokenId)
        return res
      }
      setError(res.error)
      return res
    } finally {
      setPending(false)
    }
  }

  return { mint, pending, tokenId, error }
}
