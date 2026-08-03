import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getAllProductsAdmin } from "@/lib/data/admin"
import { getBlockchainRefs } from "@/lib/data/blockchain"
import { AdminProductsClient, type BlockchainState } from "./admin-products-client"

export const metadata: Metadata = { title: "Product Moderation" }

export default async function AdminProductsPage() {
  await requireUser(["admin"])
  const products = await getAllProductsAdmin()

  const refs = await getBlockchainRefs(products.map((p) => p.id))
  const blockchain: Record<string, BlockchainState> = {}
  for (const p of products) {
    const ref = refs.get(p.id)
    blockchain[p.id] = { tokenId: ref?.tokenId ?? null, attested: Boolean(ref?.attestedAt) }
  }

  return <AdminProductsClient products={products} blockchain={blockchain} />
}
