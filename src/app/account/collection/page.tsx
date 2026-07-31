import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getOrdersForBuyer } from "@/lib/data/orders"
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

  const items: CollectionEntry[] = orders
    .filter((o) => OWNED_STATUSES.includes(o.status))
    .flatMap((o) =>
      o.items.map((it) => ({
        id: it.id,
        title: it.title,
        slug: it.slug,
        gradient: it.gradient,
        purchasedDate: o.date,
        purchasePrice: it.price,
        currentValue: Math.round(it.price * upliftFactor(it.productId)),
      })),
    )

  return <CollectionClient items={items} />
}
