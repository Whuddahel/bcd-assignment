import "server-only"
import { JsonRpcProvider, Wallet, Contract } from "ethers"
import { env } from "@/lib/env"
import {
  RPC_URL,
  ASSET_ADDRESS,
  ATTESTOR_ADDRESS,
  ASSET_ABI,
  ATTESTOR_ABI,
  isBlockchainConfigured,
} from "./config"
import { onchainProductId, addressForUser } from "./identity"

// Server-only signer. The platform holds ONE key (Hardhat account #0 in local
// dev) and signs every platform action — mint, attest, transfer — on behalf of
// sellers/admins/buyers who have no wallets. This module must never be imported
// into a client component; `server-only` enforces that at build time.

export class BlockchainNotConfiguredError extends Error {
  constructor() {
    super("Blockchain is not configured — deploy the contracts first.")
    this.name = "BlockchainNotConfiguredError"
  }
}

function getOperator(): Wallet {
  const provider = new JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true })
  return new Wallet(env.BLOCKCHAIN_OPERATOR_KEY, provider)
}

function getAssetWriter(): Contract {
  return new Contract(ASSET_ADDRESS, ASSET_ABI, getOperator())
}

function getAttestorWriter(): Contract {
  return new Contract(ATTESTOR_ADDRESS, ATTESTOR_ABI, getOperator())
}

export type MintResult = { tokenId: string; alreadyMinted: boolean }

/**
 * Mint the digital twin for a product. Idempotent: if the product was already
 * minted, returns the existing token id instead of reverting.
 */
export async function mintOnChain(productUuid: string, metadataUri: string): Promise<MintResult> {
  if (!isBlockchainConfigured) throw new BlockchainNotConfiguredError()

  const asset = getAssetWriter()
  const productId = onchainProductId(productUuid)

  const existing: bigint = await asset.tokenOfProduct(productId)
  if (existing > BigInt(0)) return { tokenId: existing.toString(), alreadyMinted: true }

  const tx = await asset.mintDigitalTwin(productId, metadataUri)
  const receipt = await tx.wait()

  // Recover the token id from the DigitalTwinMinted event.
  let tokenId: bigint | null = null
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = asset.interface.parseLog(log)
      if (parsed?.name === "DigitalTwinMinted") {
        tokenId = parsed.args.tokenId as bigint
        break
      }
    } catch {
      // not one of our events
    }
  }
  const resolved: bigint = tokenId ?? (await asset.tokenOfProduct(productId))

  return { tokenId: resolved.toString(), alreadyMinted: false }
}

/** Attest a token's authenticity. No-op-safe if already attested. */
export async function attestOnChain(tokenId: string, certHash: string): Promise<void> {
  if (!isBlockchainConfigured) throw new BlockchainNotConfiguredError()

  const attestor = getAttestorWriter()
  const already: boolean = await attestor.isAttested(tokenId)
  if (already) return

  const tx = await attestor.attestAuthenticity(tokenId, certHash)
  await tx.wait()
}

/**
 * Transfer a token to the buyer's derived address (called when an order is
 * delivered). Safe to call more than once — skips if already owned by the buyer.
 */
export async function transferToBuyer(tokenId: string, buyerUserId: string): Promise<string> {
  if (!isBlockchainConfigured) throw new BlockchainNotConfiguredError()

  const asset = getAssetWriter()
  const buyerAddress = addressForUser(buyerUserId)

  const currentOwner: string = await asset.ownerOf(tokenId)
  if (currentOwner.toLowerCase() === buyerAddress.toLowerCase()) return buyerAddress

  const tx = await asset.transferAsset(tokenId, buyerAddress)
  await tx.wait()
  return buyerAddress
}
