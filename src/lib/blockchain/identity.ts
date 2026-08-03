import { id, getAddress } from "ethers"

// Pure helpers shared by client, server, and the Hardhat seed script. No wallets
// exist in this demo, so on-chain identities are derived deterministically from
// off-chain ids. Keeping this logic in one place guarantees the frontend and the
// seed script agree on every address / product id.

/**
 * Map a Supabase product UUID to the contract's `uint256 productId`.
 * keccak256(uuid) is a 32-byte value that fits a uint256 exactly.
 */
export function onchainProductId(productUuid: string): bigint {
  return BigInt(id(productUuid))
}

/**
 * A stable, wallet-less address for a user. Buyers don't hold keys in this demo,
 * so ownership is tracked against this derived address. Mirrors the assignment's
 * `ethers.id(userId).slice(0, 42)` recipe, checksummed so ethers accepts it.
 */
export function addressForUser(userId: string): string {
  return getAddress(id(userId).slice(0, 42))
}

/** "0x1234…abcd" — compact address for the UI. */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
