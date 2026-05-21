import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { ProductCard } from "@/components/shop/product-card"
import { MOCK_PRODUCTS } from "@/lib/mock"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Wishlist" }

// Mock: show first 5 as wishlisted
const WISHLISTED = MOCK_PRODUCTS.slice(0, 5)

export default function WishlistPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-pink-400">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold">My <GradientText>Wishlist</GradientText></h1>
        <p className="mt-2 text-sm text-muted-foreground">{WISHLISTED.length} saved items</p>
      </div>

      {WISHLISTED.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Save items you love while browsing.</p>
          <Button className="gradient-brand mt-6 border-0 text-white" asChild>
            <Link href="/browse">Discover items</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WISHLISTED.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} wishlistDefault />
          ))}
        </div>
      )}
    </div>
  )
}
