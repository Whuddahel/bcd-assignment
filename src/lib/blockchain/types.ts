// Plain, serializable shapes the UI renders. These cross the server→client
// boundary (server actions / props), so they contain no BigInt or ethers objects.

export type ProvenanceEventType = "Minted" | "Transferred" | string

export type ProvenanceEvent = {
  owner: string
  /** Unix seconds. */
  timestamp: number
  event: ProvenanceEventType
}

export type AttestationInfo = {
  exists: boolean
  attestor: string
  certHash: string
  /** Unix seconds. */
  timestamp: number
}

export type AssetProvenance = {
  tokenId: string
  /** Current on-chain owner (last entry in the chain of custody). */
  owner: string | null
  events: ProvenanceEvent[]
  attestation: AttestationInfo
}

/** The off-chain bridge record stored on a product row. */
export type BlockchainRef = {
  tokenId: string
  mintedAt: string | null
  attestedAt: string | null
}
