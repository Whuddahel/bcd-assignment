"use client"

import { create } from "zustand"

export type NotificationType =
  | "order_shipped"
  | "order_delivered"
  | "price_drop"
  | "seller_approved"
  | "review_reply"
  | "new_message"

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string
  href?: string
  readAt: string | null
  createdAt: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "order_shipped",
    title: "Order shipped",
    body: "Your Cartier Love Bracelet is on its way — FedEx tracking: 8821049",
    href: "/account/orders",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "n2",
    type: "price_drop",
    title: "Price drop on your wishlist",
    body: "Bottega Veneta Cassette dropped 8% — now $2,850",
    href: "/product/bottega-cassette-cobalt",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "n3",
    type: "order_delivered",
    title: "Order delivered",
    body: "Your Chanel Classic Flap was delivered. How was your experience?",
    href: "/account/orders",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "n4",
    type: "review_reply",
    title: "Seller replied to your review",
    body: "WatchVault Geneva replied: \"Thank you for the kind words!\"",
    href: "/product/rolex-daytona-white",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

interface NotificationsStore {
  notifications: Notification[]
  isOpen: boolean
  unreadCount: () => number
  markRead: (id: string) => void
  markAllRead: () => void
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
}

export const useNotificationsStore = create<NotificationsStore>()((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  isOpen: false,

  unreadCount: () => get().notifications.filter((n) => !n.readAt).length,

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({
        ...n,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
    })),

  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
}))
