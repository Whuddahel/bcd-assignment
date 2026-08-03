import { getAssetReader, getAttestorReader } from "./client"
import { isBlockchainConfigured } from "./config"
import type { AssetProvenance, AttestationInfo, ProvenanceEvent } from "./types"

// Read helpers used by the client hooks. Every function is degrade-safe: if the
// node is down, the contracts aren't deployed, or the token doesn't exist yet, it
// resolves to a well-defined empty value rather than throwing — so the UI can
// always render a graceful "not yet on blockchain" state.

const EMPTY_ATTESTATION: AttestationInfo = {
  exists: false,
  attestor: "",
  certHash: "",
  timestamp: 0,
}

/** Read the attestation for a token (never throws). */
export async function getAttestation(tokenId: string): Promise<AttestationInfo> {
  if (!isBlockchainConfigured) return EMPTY_ATTESTATION
  try {
    const attestor = getAttestorReader()
    const a = await attestor.getAttestation(tokenId)
    return {
      exists: Boolean(a.exists),
      attestor: a.exists ? String(a.attestor) : "",
      certHash: String(a.certHash ?? ""),
      timestamp: Number(a.timestamp ?? 0),
    }
  } catch {
    return EMPTY_ATTESTATION
  }
}

/** Read the full provenance + attestation for a token (never throws). */
export async function getProvenance(tokenId: string): Promise<AssetProvenance | null> {
  if (!isBlockchainConfigured || !tokenId) return null

  try {
    const asset = getAssetReader()
    const [rawEvents, attestation, owner] = await Promise.all([
      asset.getProvenance(tokenId),
      getAttestation(tokenId),
      asset.ownerOf(tokenId).catch(() => null),
    ])

    const events: ProvenanceEvent[] = (rawEvents as unknown[]).map((e) => {
      const entry = e as { owner: string; timestamp: bigint; eventType: string }
      return {
        owner: String(entry.owner),
        timestamp: Number(entry.timestamp),
        event: String(entry.eventType),
      }
    })

    // A token with no provenance events has never been minted.
    if (events.length === 0) return null

    return {
      tokenId,
      owner: owner ? String(owner) : null,
      events,
      attestation,
    }
  } catch {
    return null
  }
}

/** Current on-chain owner of a token, or null if unminted / unreachable. */
export async function getOwner(tokenId: string): Promise<string | null> {
  if (!isBlockchainConfigured || !tokenId) return null
  try {
    const asset = getAssetReader()
    return String(await asset.ownerOf(tokenId))
  } catch {
    return null
  }
}
