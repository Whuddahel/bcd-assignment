"use client"

import { useCallback, useEffect, useState } from "react"
import { getProvenance } from "../reads"
import type { AssetProvenance } from "../types"

/**
 * Read the on-chain provenance + attestation for a product's token. Unsigned —
 * runs straight from the browser against the local node. Resolves to `null` for
 * a product that isn't minted yet, so callers render a graceful fallback.
 */
export function useProvenance(tokenId?: string | null) {
  const [data, setData] = useState<AssetProvenance | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(tokenId))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tokenId) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await getProvenance(tokenId))
    } catch {
      setError("Couldn't reach the blockchain node.")
    } finally {
      setLoading(false)
    }
  }, [tokenId])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, refetch: load }
}
