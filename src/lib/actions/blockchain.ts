"use server"

import { revalidatePath } from "next/cache"
import { getSessionUser } from "@/lib/auth/session"
import {
  createSupabaseServerClient,
  createSupabaseServerAdminClient,
} from "@/lib/supabase/server"
import { mintOnChain, attestOnChain } from "@/lib/blockchain/server"
import { isBlockchainConfigured } from "@/lib/blockchain/config"

// Platform blockchain actions. The browser never signs anything — these run on
// the server, resolve the caller's role, then use the operator signer. The write
// hooks (useMint / useAttest) just call these.

export type BlockchainActionResult =
  | { ok: true; tokenId: string; message: string }
  | { ok: false; error: string }

function notConfigured(): BlockchainActionResult {
  return {
    ok: false,
    error: "Blockchain isn't running. Start the Hardhat node and deploy the contracts.",
  }
}

/**
 * Mint the digital twin for one of the seller's own products. Writes the token
 * id back to Supabase so the rest of the app can find it.
 */
export async function mintDigitalTwinAction(
  productId: string,
): Promise<BlockchainActionResult> {
  if (!isBlockchainConfigured) return notConfigured()

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "You must be signed in." }
  if (user.role !== "seller" && user.role !== "admin") {
    return { ok: false, error: "Only sellers can mint digital twins." }
  }

  const supabase = await createSupabaseServerClient()

  // Load the product + verify the caller owns it (admins may mint any product).
  const { data: product } = await supabase
    .from("products")
    .select("id, title, description, seller_id, product_images(url,is_primary), seller_profiles(user_id)")
    .eq("id", productId)
    .maybeSingle()

  if (!product) return { ok: false, error: "Product not found." }

  const ownerUserId = (product.seller_profiles as { user_id?: string } | null)?.user_id
  if (user.role !== "admin" && ownerUserId !== user.id) {
    return { ok: false, error: "You can only mint your own listings." }
  }

  const image =
    (product.product_images as { url: string; is_primary: boolean }[] | null)?.find(
      (i) => i.is_primary,
    )?.url ?? null

  const metadataUri = JSON.stringify({
    name: product.title,
    description: product.description ?? "",
    supabaseId: product.id,
    image,
  })

  try {
    const { tokenId, alreadyMinted } = await mintOnChain(product.id, metadataUri)

    // Bridge the token id back into Supabase (admin client — bypass RLS).
    const admin = await createSupabaseServerAdminClient()
    await admin
      .from("products")
      .update({ blockchain_token_id: tokenId, blockchain_minted_at: new Date().toISOString() })
      .eq("id", product.id)

    revalidatePath(`/seller/products`)
    revalidatePath(`/product`, "layout")

    return {
      ok: true,
      tokenId,
      message: alreadyMinted
        ? `Already minted as token #${tokenId}.`
        : `Digital twin minted as token #${tokenId}.`,
    }
  } catch (err) {
    console.error("mintDigitalTwinAction failed", err)
    return { ok: false, error: "Minting failed. Is the Hardhat node running?" }
  }
}

/**
 * Attest authenticity for a minted product. Admin only. Writes the attestation
 * timestamp back to Supabase.
 */
export async function attestProductAction(
  productId: string,
): Promise<BlockchainActionResult> {
  if (!isBlockchainConfigured) return notConfigured()

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "You must be signed in." }
  if (user.role !== "admin") {
    return { ok: false, error: "Only admins can attest authenticity." }
  }

  const supabase = await createSupabaseServerClient()
  const { data: product } = await supabase
    .from("products")
    .select("id, blockchain_token_id")
    .eq("id", productId)
    .maybeSingle()

  if (!product) return { ok: false, error: "Product not found." }
  const tokenId = product.blockchain_token_id
  if (!tokenId) {
    return { ok: false, error: "This product hasn't been minted yet — mint it first." }
  }

  // Demo certificate hash. In production this would be the IPFS hash of the
  // signed certificate document.
  const certHash = `ipfs://aureon-cert-${tokenId}`

  try {
    await attestOnChain(tokenId, certHash)

    const admin = await createSupabaseServerAdminClient()
    await admin
      .from("products")
      .update({ blockchain_attested_at: new Date().toISOString() })
      .eq("id", product.id)

    revalidatePath(`/admin/products`)
    revalidatePath(`/product`, "layout")

    return { ok: true, tokenId, message: `Token #${tokenId} attested authentic.` }
  } catch (err) {
    console.error("attestProductAction failed", err)
    return { ok: false, error: "Attestation failed. Is the Hardhat node running?" }
  }
}
