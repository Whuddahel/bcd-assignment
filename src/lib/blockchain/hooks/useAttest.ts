"use client"

import { useState } from "react"
import { attestProductAction } from "@/lib/actions/blockchain"

/**
 * Admin action: attest a minted product's authenticity. Signing happens on the
 * server (operator key); this hook only tracks pending/result state.
 */
export function useAttest() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function attest(productId: string) {
    setPending(true)
    setError(null)
    try {
      const res = await attestProductAction(productId)
      if (!res.ok) setError(res.error)
      return res
    } finally {
      setPending(false)
    }
  }

  return { attest, pending, error }
}
