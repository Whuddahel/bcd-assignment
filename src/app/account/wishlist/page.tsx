import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getWishlist } from "@/lib/data/wishlist"
import { WishlistClient } from "./wishlist-client"

export const metadata: Metadata = { title: "My Wishlist" }

export default async function WishlistPage() {
  const user = await requireUser()
  const items = await getWishlist(user.id)
  return <WishlistClient initialItems={items} />
}
