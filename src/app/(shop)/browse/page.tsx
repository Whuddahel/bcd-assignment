import type { Metadata } from "next"
import { getProducts } from "@/lib/data/products"
import { getCategories } from "@/lib/data/categories"
import { getWishlistIds } from "@/lib/data/wishlist"
import { getSessionUser } from "@/lib/auth/session"
import { BrowseClient } from "./browse-client"

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse authenticated luxury watches, art, and rare collectibles on Aureon.",
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const user = await getSessionUser()

  const [products, categories, wishlistedIds] = await Promise.all([
    getProducts({ limit: 200 }),
    getCategories(),
    user && !user.isMock ? getWishlistIds(user.id) : Promise.resolve(new Set<string>()),
  ])

  return (
    <BrowseClient
      products={products}
      categories={categories}
      wishlistedIds={[...wishlistedIds]}
      initialCategory={category ?? null}
      initialQuery={q ?? ""}
    />
  )
}
