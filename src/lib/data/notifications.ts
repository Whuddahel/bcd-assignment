import "server-only"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import type { Notification, UserRole } from "@/types/database"

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  return count ?? 0
}

/**
 * Notification kinds the inbox knows how to render (icon + colour live in
 * components/layout/notifications-dropdown.tsx). Unknown kinds still display,
 * with a generic bell — but keep the two lists in step.
 */
export type NotificationKind =
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_refunded"
  | "payment_failed"
  | "new_sale"
  | "seller_approved"
  | "seller_application"
  | "listing_approved"
  | "listing_rejected"
  | "new_message"

export type NewNotification = {
  userId: string
  type: NotificationKind
  title: string
  body?: string
  href?: string
}

/**
 * Write notifications for any user.
 *
 * The `notifications_insert_admin` RLS policy means a normal session may not
 * insert rows for itself, let alone for the other party in a transaction — so
 * this always goes through the service-role client. Never throws: a missed
 * notification must not roll back the order, refund or reply that caused it.
 */
export async function notify(entries: NewNotification | NewNotification[]): Promise<void> {
  const rows = (Array.isArray(entries) ? entries : [entries]).filter((n) => n.userId)
  if (rows.length === 0) return

  try {
    const admin = await createSupabaseServerAdminClient()
    const { error } = await admin.from("notifications").insert(
      rows.map((n) => ({
        user_id: n.userId,
        type: n.type,
        title: n.title,
        body: n.body ?? null,
        href: n.href ?? null,
      })),
    )
    if (error) console.error("notify: failed to write notifications", error.message)
  } catch (err) {
    console.error("notify: notification write skipped", err)
  }
}

/** Profile ids for the given staff roles — used to route platform-level alerts. */
export async function getStaffUserIds(
  roles: UserRole[] = ["admin"],
): Promise<string[]> {
  try {
    const admin = await createSupabaseServerAdminClient()
    const { data } = await admin.from("profiles").select("id").in("role", roles)
    return (data ?? []).map((p) => p.id)
  } catch {
    return []
  }
}

/** The user behind a seller profile, for notifying the seller side of an order. */
export async function getSellerOwnerIds(sellerIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(sellerIds)].filter(Boolean)
  if (unique.length === 0) return new Map()

  try {
    const admin = await createSupabaseServerAdminClient()
    const { data } = await admin.from("seller_profiles").select("id, user_id").in("id", unique)
    return new Map((data ?? []).map((s) => [s.id, s.user_id]))
  } catch {
    return new Map()
  }
}
