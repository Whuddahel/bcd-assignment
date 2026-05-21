"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ShoppingCart, ArrowRight, Trash2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/stores/cart-store"
import { formatPrice, cn } from "@/lib/utils"

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } =
    useCartStore()

  const total = totalPrice()
  const count = totalItems()
  const platformFee = Math.round(total * 0.1)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-midnight-50 shadow-[−32px_0_80px_oklch(0_0_0/0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-5 w-5 text-violet-400" />
                <span className="font-semibold text-foreground">Cart</span>
                {count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500/20 px-1.5 text-xs font-bold text-violet-300">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Your cart is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discover rare collectibles to add
                  </p>
                  <Button
                    className="gradient-brand mt-6 border-0 text-white"
                    onClick={closeCart}
                    asChild
                  >
                    <Link href="/browse">Browse items</Link>
                  </Button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-4 py-4">
                        {/* Thumbnail */}
                        <div
                          className={cn(
                            "h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br",
                            item.product.gradient,
                          )}
                        />

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="line-clamp-2 text-sm font-medium text-foreground leading-snug">
                            {item.product.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.product.sellerName}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <p className="text-sm font-bold text-foreground">
                              {formatPrice(item.product.price * item.qty)}
                            </p>

                            {/* Qty controls */}
                            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5">
                              <button
                                onClick={() => updateQty(item.product.id, item.qty - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-foreground">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.product.id, item.qty + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Separator className="bg-white/5" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 px-6 py-5">
                {/* Breakdown */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform fee (10%)</span>
                    <span className="font-medium text-foreground">{formatPrice(platformFee)}</span>
                  </div>
                  <Separator className="bg-white/5" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-foreground">{formatPrice(total + platformFee)}</span>
                  </div>
                </div>

                <Button
                  className="gradient-brand btn-glow w-full gap-2 border-0 text-white hover:opacity-90"
                  size="lg"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/checkout">
                    Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                {/* Trust */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-violet-400" />
                  Secured & authenticated — every item verified
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
