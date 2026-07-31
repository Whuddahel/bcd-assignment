import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getProductBySlug,
  getRelatedProducts,
  incrementProductView,
} from "@/lib/data/products"
import { getReviewsForProduct } from "@/lib/data/reviews"
import { getWishlistIds } from "@/lib/data/wishlist"
import { getSessionUser } from "@/lib/auth/session"
import { ProductDetail } from "./product-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product not found" }
  return {
    title: product.title,
    description: product.description.slice(0, 155),
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const user = await getSessionUser()

  const [related, reviews, wishlistedIds] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.id, 4),
    getReviewsForProduct(product.id),
    user && !user.isMock ? getWishlistIds(user.id) : Promise.resolve(new Set<string>()),
  ])

  // Fire-and-forget view bump (never blocks render).
  void incrementProductView(product.id)

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  return (
    <ProductDetail
      product={product}
      related={related}
      reviews={reviews}
      avgRating={avgRating}
      wishlistedDefault={wishlistedIds.has(product.id)}
      canReview={Boolean(user && !user.isMock)}
    />
  )
}
