import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getOrdersForBuyer, getResoldOrderItemIds } from "@/lib/data/orders"
import { getBlockchainRefs } from "@/lib/data/blockchain"
import { CollectionClient, type CollectionEntry } from "./collection-client"

export const metadata: Metadata = { title: "My Collection" }

// Owned = items from orders that have been paid/fulfilled.
const OWNED_STATUSES = ["confirmed", "shipped", "delivered"]

/** Deterministic 0–9% uplift so estimated value is stable across renders. */
function upliftFactor(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return 1 + (Math.abs(h) % 10) / 100
}

export default async function CollectionPage() {
  const user = await requireUser()
  const orders = await getOrdersForBuyer(user.id)

  const owned = orders.filter((o) => OWNED_STATUSES.includes(o.status))

  // Exclude items already relisted for resale — once sold onward, it's no
  // longer genuinely "yours" even though this order is still in your history.
  const resoldItemIds = await getResoldOrderItemIds(owned.flatMap((o) => o.items.map((it) => it.id)))

  // Look up on-chain token ids for every owned product in one query.
  const productIds = [...new Set(owned.flatMap((o) => o.items.map((it) => it.productId)))]
  const refs = await getBlockchainRefs(productIds)

  const items: CollectionEntry[] = owned.flatMap((o) =>
    o.items
      .filter((it) => !resoldItemIds.has(it.id))
      .map((it) => ({
        id: it.id,
        title: it.title,
        slug: it.slug,
        gradient: it.gradient,
        image: it.image,
        purchasedDate: o.date,
        purchasePrice: it.price,
        currentValue: Math.round(it.price * upliftFactor(it.productId)),
        tokenId: refs.get(it.productId)?.tokenId ?? null,
      })),
  )

  return <CollectionClient items={items} userId={user.id} />
}
