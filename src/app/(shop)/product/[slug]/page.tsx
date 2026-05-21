"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Heart, ShoppingCart, Share2, Shield, CheckCircle, Star,
  ChevronRight, Package, Clock, ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GradientText } from "@/components/brand/gradient-text"
import { ProductCard } from "@/components/shop/product-card"
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mock"
import { formatPrice, cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCartStore } from "@/stores/cart-store"

const conditionColor: Record<string, string> = {
  mint:       "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  excellent:  "text-green-400 border-green-500/30 bg-green-500/10",
  very_good:  "text-lime-400 border-lime-500/30 bg-lime-500/10",
  good:       "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  fair:       "text-orange-400 border-orange-500/30 bg-orange-500/10",
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const product = MOCK_PRODUCTS.find(p => p.slug === slug) ?? notFound()

  const [wishlisted, setWishlisted] = useState(false)
  const [imgError,   setImgError]   = useState(false)

  const addItem = useCartStore((s) => s.addItem)

  const related = MOCK_PRODUCTS.filter(
    p => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4)

  const reviews = MOCK_REVIEWS.filter(r => r.productId === product.id)
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null

  function handleAddToCart() {
    addItem(product)
    toast.success("Added to cart", { description: product.title })
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  return (
    <div className="min-h-screen bg-midnight">
      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-midnight-50/30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/browse" className="hover:text-foreground">Browse</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/browse?category=${product.categorySlug}`} className="hover:text-foreground capitalize">
              {product.categoryName}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className={cn("relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br", product.gradient)}>
              {!imgError && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-80"
                  priority
                  onError={() => setImgError(true)}
                />
              ) : null}

              {product.badge && (
                <div className="absolute left-4 top-4 z-10">
                  <span className="rounded-full bg-black/40 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                    {product.badge}
                  </span>
                </div>
              )}

              <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => setWishlisted(w => !w)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all",
                    wishlisted ? "bg-pink-500/80 text-white" : "bg-black/30 text-white/80 hover:bg-black/50"
                  )}
                  aria-label="Add to wishlist"
                >
                  <Heart className={cn("h-4.5 w-4.5", wishlisted && "fill-current")} />
                </button>
                <button
                  onClick={handleShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm hover:bg-black/50 transition-all"
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {product.rarity && (
                <div className="absolute bottom-4 left-4 z-10">
                  <Badge variant="outline" className="border-white/20 bg-black/30 text-white/80 backdrop-blur-sm">
                    {product.rarity}
                  </Badge>
                </div>
              )}
            </div>

            {/* View count */}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              👁 {product.viewCount.toLocaleString()} views · ♥ {product.wishlistCount.toLocaleString()} wishlisted
            </p>
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Seller */}
            <Link href={`/sellers/${product.sellerId}`} className="group mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand text-sm font-bold text-white">
                {product.sellerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-violet-400 transition-colors">
                  {product.sellerName}
                  {product.sellerVerified && <CheckCircle className="h-3.5 w-3.5 text-violet-400" />}
                </div>
                <p className="text-xs text-muted-foreground">Verified seller</p>
              </div>
            </Link>

            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.title}
            </h1>

            {/* Category + condition */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-white/10 text-muted-foreground">
                {product.categoryName}
              </Badge>
              <Badge
                variant="outline"
                className={cn("capitalize", conditionColor[product.condition])}
              >
                <Shield className="mr-1 h-3 w-3" />
                {product.condition.replace("_", " ")}
              </Badge>
            </div>

            {/* Rating */}
            {avgRating && (
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-4 w-4", i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                ))}
                <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Ask price</p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold tracking-tight">
                  <GradientText>{formatPrice(product.price)}</GradientText>
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="gradient-brand btn-glow flex-1 gap-2 border-0 text-white hover:opacity-90"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setWishlisted(w => !w)}
                className={cn(
                  "gap-2 border-white/10",
                  wishlisted ? "bg-pink-500/10 border-pink-500/30 text-pink-400" : "hover:bg-white/5"
                )}
              >
                <Heart className={cn("h-4.5 w-4.5", wishlisted && "fill-current")} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Authenticated", sub: "Every item verified" },
                { icon: Package, label: "Insured shipping", sub: "Full coverage" },
                { icon: Clock,   label: "14-day returns", sub: "If not as described" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="glass-card rounded-xl p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-violet-400" />
                  <p className="mt-1.5 text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Attributes */}
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
              <div className="glass-card divide-y divide-white/5 rounded-xl overflow-hidden">
                {Object.entries(product.attributes).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{key}</span>
                    <span className="text-xs font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provenance / blockchain placeholder */}
            <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-violet-500/20 p-2">
                  <Shield className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Provenance Verified</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This item has been authenticated by our in-house team.
                    {/* BLOCKCHAIN Phase 2: On-chain provenance record will display here */}
                  </p>
                  <Badge className="mt-2 bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px]">
                    Blockchain verification — coming soon
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-20">
            <Separator className="mb-10 bg-white/5" />
            <h2 className="mb-8 font-display text-2xl font-bold">
              Reviews <GradientText>({reviews.length})</GradientText>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: EASE }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-foreground">{r.reviewer}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                      ))}
                    </div>
                  </div>
                  {r.title && <p className="mt-2 text-sm font-semibold text-foreground">{r.title}</p>}
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <Separator className="mb-10 bg-white/5" />
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold">
                More in <GradientText>{product.categoryName}</GradientText>
              </h2>
              <Link href={`/browse?category=${product.categorySlug}`} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </div>
      </div>
    </div>
  )
}
