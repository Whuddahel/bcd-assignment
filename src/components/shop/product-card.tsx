"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Heart, Shield, CheckCircle, ShoppingCart, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import type { MockProduct } from "@/lib/mock"
import { useCartStore } from "@/stores/cart-store"
import { toast } from "sonner"

interface ProductCardProps {
  product: MockProduct
  index?: number
  wishlistDefault?: boolean
}

const conditionLabel: Record<MockProduct["condition"], string> = {
  mint:       "Mint",
  excellent:  "Excellent",
  very_good:  "Very Good",
  good:       "Good",
  fair:       "Fair",
}

const conditionColor: Record<MockProduct["condition"], string> = {
  mint:       "text-emerald-400",
  excellent:  "text-green-400",
  very_good:  "text-lime-400",
  good:       "text-yellow-400",
  fair:       "text-orange-400",
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const SPRING = { stiffness: 150, damping: 20, mass: 0.8 }

export function ProductCard({ product, index = 0, wishlistDefault = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(wishlistDefault)
  const [imgError,   setImgError]   = useState(false)
  const [hovered,    setHovered]    = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const addItem = useCartStore((s) => s.addItem)

  // 3D tilt values
  const rotateX = useSpring(useMotionValue(0), SPRING)
  const rotateY = useSpring(useMotionValue(0), SPRING)
  const scale   = useSpring(useMotionValue(1), SPRING)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    rotateY.set(x * 12)
    rotateX.set(-y * 12)
  }

  function onMouseEnter() {
    scale.set(1.03)
    setHovered(true)
  }

  function onMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    setHovered(false)
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (product.status === "sold") return
    addItem(product)
    toast.success("Added to cart", { description: product.title })
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted((w) => !w)
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: product.title,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: EASE }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Link href={`/product/${product.slug}`} className="group block">
          <div
            className={cn(
              "glass-card overflow-hidden rounded-2xl transition-shadow duration-300",
              hovered && "shadow-[0_28px_70px_oklch(0_0_0/0.55)]",
            )}
          >
            {/* Image / gradient */}
            <div className={cn("relative h-56 bg-gradient-to-br", product.gradient)}>
              {!imgError && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
                  onError={() => setImgError(true)}
                />
              ) : null}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Badge */}
              {product.badge && (
                <div className="absolute left-3 top-3 z-10">
                  <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
                <motion.button
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={handleWishlist}
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all",
                    wishlisted
                      ? "bg-pink-500/90 text-white"
                      : "bg-black/40 text-white/80 hover:bg-black/60 hover:text-white",
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-current")} />
                </motion.button>
              </div>

              {/* Rarity */}
              {product.rarity && (
                <div className="absolute bottom-3 left-3 z-10">
                  <Badge
                    variant="outline"
                    className="border-white/20 bg-black/40 text-white/90 backdrop-blur-sm text-[10px]"
                  >
                    {product.rarity}
                  </Badge>
                </div>
              )}

              {/* Sold overlay */}
              {product.status === "sold" && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                  <span className="text-sm font-bold uppercase tracking-widest text-white/90">
                    Sold
                  </span>
                </div>
              )}

              {/* Add-to-cart hover reveal */}
              {product.status !== "sold" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-3 right-3 z-10"
                >
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-1.5 rounded-full bg-violet-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-violet-500"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to cart
                  </button>
                </motion.div>
              )}

              {/* View count — top right on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered ? 1 : 0 }}
                className="absolute left-3 bottom-3 z-10 flex items-center gap-1 text-[10px] text-white/70"
              >
                <Eye className="h-3 w-3" />
                {product.viewCount.toLocaleString()}
              </motion.div>
            </div>

            {/* Info */}
            <div className="p-4">
              {/* Seller */}
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">{product.sellerName}</span>
                {product.sellerVerified && (
                  <CheckCircle className="h-3 w-3 text-violet-400" aria-label="Verified seller" />
                )}
              </div>

              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-violet-300">
                {product.title}
              </h3>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ask price</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-medium", conditionColor[product.condition])}>
                  <Shield className="h-3 w-3" />
                  {conditionLabel[product.condition]}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
