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

interface NotificationsStore {
  notifications: Notification[]
  isOpen: boolean
  setNotifications: (n: Notification[]) => void
  unreadCount: () => number
  markRead: (id: string) => void
  markAllRead: () => void
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
}

export const useNotificationsStore = create<NotificationsStore>()((set, get) => ({
  // Hydrated from the database via the notifications dropdown on mount.
  notifications: [],
  isOpen: false,

  setNotifications: (notifications) => set({ notifications }),

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
