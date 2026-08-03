import { env } from "@/lib/env"
import deployments from "./deployments.json"

// Single source of truth for "how do I reach the contracts". Reads the manifest
// that `scripts/deploy.js` writes, plus the env overrides. Safe on client + server
// (the manifest holds only public addresses + ABIs — never a private key).

export const RPC_URL = env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL
export const CHAIN_ID = env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID

export const ASSET_ADDRESS = deployments.contracts?.AureonAsset?.address ?? ""
export const ATTESTOR_ADDRESS = deployments.contracts?.AureonAttestor?.address ?? ""

export const ASSET_ABI = deployments.contracts?.AureonAsset?.abi ?? []
export const ATTESTOR_ABI = deployments.contracts?.AureonAttestor?.abi ?? []

const ZERO = "0x0000000000000000000000000000000000000000"

/** True once contracts have been deployed and the manifest points at them. */
export const isBlockchainConfigured = Boolean(
  ASSET_ADDRESS && ASSET_ADDRESS !== ZERO && ATTESTOR_ADDRESS && ATTESTOR_ADDRESS !== ZERO,
)
