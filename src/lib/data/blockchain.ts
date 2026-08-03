import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { BlockchainRef } from "@/lib/blockchain/types"

// The off-chain half of the bridge: read a product's stored token id. Kept in its
// own isolated query so a missing `blockchain_*` column (migration not yet
// applied) degrades to "not minted" instead of breaking the whole product page.

const BLOCKCHAIN_COLS = "blockchain_token_id, blockchain_minted_at, blockchain_attested_at"

type Row = {
  blockchain_token_id: string | null
  blockchain_minted_at: string | null
  blockchain_attested_at: string | null
}

function toRef(row: Row | null): BlockchainRef | null {
  if (!row?.blockchain_token_id) return null
  return {
    tokenId: row.blockchain_token_id,
    mintedAt: row.blockchain_minted_at,
    attestedAt: row.blockchain_attested_at,
  }
}

/** The token bridge for one product, or null if unminted / column absent. */
export async function getBlockchainRef(productId: string): Promise<BlockchainRef | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("products")
      .select(BLOCKCHAIN_COLS)
      .eq("id", productId)
      .maybeSingle()
    if (error) return null
    return toRef(data as Row | null)
  } catch {
    return null
  }
}

/** The token bridges for many products, keyed by product id. */
export async function getBlockchainRefs(
  productIds: string[],
): Promise<Map<string, BlockchainRef>> {
  const out = new Map<string, BlockchainRef>()
  if (productIds.length === 0) return out
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("products")
      .select(`id, ${BLOCKCHAIN_COLS}`)
      .in("id", productIds)
    if (error || !data) return out
    for (const row of data as (Row & { id: string })[]) {
      const ref = toRef(row)
      if (ref) out.set(row.id, ref)
    }
    return out
  } catch {
    return out
  }
}
