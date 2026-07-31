"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProductVM } from "@/lib/data/types"

export type CartItem = {
  product: ProductVM
  qty: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: ProductVM) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) =>
        set((s) => {
          const existing = s.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
              ),
              isOpen: true,
            }
          }
          return { items: [...s.items, { product, qty: 1 }], isOpen: true }
        }),

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),

      updateQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product.id !== productId)
              : s.items.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      totalItems: () => get().items.reduce((n, i) => n + i.qty, 0),
      totalPrice: () => get().items.reduce((n, i) => n + i.product.price * i.qty, 0),
    }),
    { name: "aureon-cart", partialize: (s) => ({ items: s.items }) },
  ),
)
