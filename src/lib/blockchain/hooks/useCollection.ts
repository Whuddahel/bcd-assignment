"use client"

import { useEffect, useState } from "react"
import { getProvenance } from "../reads"
import { addressForUser } from "../identity"
import type { AssetProvenance } from "../types"

export type CollectionToken = {
  tokenId: string
  provenance: AssetProvenance | null
  /** True when the current on-chain owner is the logged-in user. */
  verified: boolean
}

/**
 * Read the on-chain state for the tokens a user owns and verify that the current
 * owner really is them (their derived, wallet-less address). Keyed by tokenId.
 */
export function useCollection(tokenIds: string[], userId?: string | null) {
  const [tokens, setTokens] = useState<Record<string, CollectionToken>>({})
  const [loading, setLoading] = useState<boolean>(tokenIds.length > 0)

  // Stable dependency so the effect doesn't loop on a fresh array each render.
  const key = tokenIds.join(",")

  useEffect(() => {
    let cancelled = false
    if (tokenIds.length === 0 || !userId) {
      setTokens({})
      setLoading(false)
      return
    }
    setLoading(true)
    const myAddress = addressForUser(userId).toLowerCase()

    Promise.all(
      tokenIds.map(async (tokenId) => {
        const provenance = await getProvenance(tokenId).catch(() => null)
        const verified = provenance?.owner?.toLowerCase() === myAddress
        return [tokenId, { tokenId, provenance, verified }] as const
      }),
    ).then((entries) => {
      if (cancelled) return
      setTokens(Object.fromEntries(entries))
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, userId])

  return { tokens, loading }
}
