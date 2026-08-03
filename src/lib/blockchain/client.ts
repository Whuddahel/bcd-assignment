import { JsonRpcProvider, Contract } from "ethers"
import {
  RPC_URL,
  ASSET_ADDRESS,
  ATTESTOR_ADDRESS,
  ASSET_ABI,
  ATTESTOR_ABI,
} from "./config"

// Read-only chain access. Unsigned, so it works for everyone (browser or server)
// and can never move an asset. Writes go through the server-side operator signer
// in `./server` — never here.

/** A JSON-RPC provider pointed at the local Hardhat node. */
export function getProvider(): JsonRpcProvider {
  // `staticNetwork` avoids an extra eth_chainId round-trip on every call.
  return new JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true })
}

/** Read-only AureonAsset instance. */
export function getAssetReader(): Contract {
  return new Contract(ASSET_ADDRESS, ASSET_ABI, getProvider())
}

/** Read-only AureonAttestor instance. */
export function getAttestorReader(): Contract {
  return new Contract(ATTESTOR_ADDRESS, ATTESTOR_ABI, getProvider())
}
