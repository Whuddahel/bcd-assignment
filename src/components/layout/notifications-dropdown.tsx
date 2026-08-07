"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Bell, Package, Truck, CheckCircle, MessageSquare, X, Check,
  ShoppingBag, BadgeCheck, Store, Undo2, Ban, AlertTriangle,
} from "lucide-react"
import { useNotificationsStore } from "@/stores/notifications-store"
import { relativeTime, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Keep in step with NotificationKind in lib/data/notifications.ts.
const typeIcon: Record<string, React.ElementType> = {
  order_confirmed:    ShoppingBag,
  order_shipped:      Truck,
  order_delivered:    Package,
  order_refunded:     Undo2,
  payment_failed:     AlertTriangle,
  new_sale:           ShoppingBag,
  seller_approved:    CheckCircle,
  seller_application: Store,
  listing_approved:   BadgeCheck,
  listing_rejected:   Ban,
  new_message:        MessageSquare,
}

const typeColor: Record<string, string> = {
  order_confirmed:    "text-violet-400 bg-violet-500/10",
  order_shipped:      "text-sky-400 bg-sky-500/10",
  order_delivered:    "text-emerald-400 bg-emerald-500/10",
  order_refunded:     "text-red-400 bg-red-500/10",
  payment_failed:     "text-red-400 bg-red-500/10",
  new_sale:           "text-emerald-400 bg-emerald-500/10",
  seller_approved:    "text-violet-400 bg-violet-500/10",
  seller_application: "text-amber-400 bg-amber-500/10",
  listing_approved:   "text-emerald-400 bg-emerald-500/10",
  listing_rejected:   "text-red-400 bg-red-500/10",
  new_message:        "text-pink-400 bg-pink-500/10",
}

/** Persist read state; the store has already updated optimistically. */
function persistRead(ids?: string[]) {
  fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids ? { ids } : {}),
  }).catch(() => {})
}

export function NotificationsDropdown() {
  const { notifications, isOpen, unreadCount, closePanel, markRead, markAllRead, setNotifications } =
    useNotificationsStore()
  const panelRef = useRef<HTMLDivElement>(null)

  // Hydrate on mount, and again whenever the panel is opened — events land in
  // the inbox server-side (an order shipping, a support reply), so a long-lived
  // tab would otherwise keep showing a stale list.
  useEffect(() => {
    let active = true
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.notifications)) setNotifications(d.notifications)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [setNotifications, isOpen])

  function handleMarkRead(id: string) {
    markRead(id)
    persistRead([id])
  }

  function handleMarkAllRead() {
    markAllRead()
    persistRead()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel()
    }
    if (isOpen) {
      window.addEventListener("keydown", onKey)
      return () => window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, closePanel])

  const count = unreadCount()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (invisible, just for click-away) */}
          <div className="fixed inset-0 z-40" onClick={closePanel} />

          <motion.div
            ref={panelRef}
            key="notif-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-400" />
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500/20 px-1.5 text-xs font-bold text-violet-300">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleMarkAllRead}
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </Button>
                )}
                <button onClick={closePanel} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">All caught up!</p>
                  <p className="mt-1 text-xs text-muted-foreground">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcon[n.type] ?? Bell
                  const color = typeColor[n.type] ?? "text-violet-400 bg-violet-500/10"
                  const isUnread = !n.readAt

                  return (
                    <Link
                      key={n.id}
                      href={n.href ?? "#"}
                      onClick={() => {
                        handleMarkRead(n.id)
                        closePanel()
                      }}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors hover:bg-white/5",
                        isUnread && "bg-violet-500/3",
                      )}
                    >
                      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm font-medium leading-snug", isUnread ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </p>
                          {isUnread && (
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {n.body}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {relativeTime(n.createdAt)}
                        </p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
