"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import type { OrderStatus } from "@/types/database"

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string }

/** Orders that are still in flight — deleting either party mid-transaction loses the trail. */
const OPEN_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "payment_processing",
  "confirmed",
  "shipped",
]

/**
 * Close the current user's account.
 *
 * Two paths, because a marketplace account is referenced by records that must
 * outlive it (a seller's sales history, a buyer's invoices):
 *
 *  1. Hard delete — `auth.admin.deleteUser` cascades through `profiles` and
 *     everything hanging off it. This is what happens for an account with no
 *     financial history.
 *  2. Erase-and-lock — when step 1 is refused by a foreign key (the account has
 *     orders, reviews or support tickets that other people's records point at),
 *     every piece of personal data is wiped, the login email is released, and
 *     the auth user is permanently banned. The account is unusable and holds no
 *     personal data; only the anonymous transaction rows survive.
 *
 * Either way the caller is signed out.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "Please sign in first." }

  let admin: Awaited<ReturnType<typeof createSupabaseServerAdminClient>>
  try {
    admin = await createSupabaseServerAdminClient()
  } catch {
    return {
      ok: false,
      error: "Account deletion is unavailable — the server is missing its Supabase service role key.",
    }
  }

  // Never leave the platform without an administrator.
  if (user.role === "admin") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")

    if ((count ?? 0) <= 1) {
      return {
        ok: false,
        error: "You are the only admin. Promote another admin before deleting this account.",
      }
    }
  }

  const blocker = await findOpenOrders(admin, user.id)
  if (blocker) return { ok: false, error: blocker }

  // Take the storefront down first, so nothing of theirs stays purchasable
  // regardless of which deletion path runs below.
  const { data: seller } = await admin
    .from("seller_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (seller) {
    await admin.from("products").update({ status: "archived" }).eq("seller_id", seller.id)
  }

  // Personal data that is never referenced by anyone else — always goes.
  await Promise.all([
    admin.from("cart_items").delete().eq("user_id", user.id),
    admin.from("wishlist_items").delete().eq("user_id", user.id),
    admin.from("notifications").delete().eq("user_id", user.id),
  ])

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) {
    const anonymised = await anonymiseAccount(admin, user.id)
    if (!anonymised) {
      return { ok: false, error: "Could not delete your account. Please contact support." }
    }
  }

  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  return { ok: true, message: "Your account has been deleted." }
}

/** A human-readable reason to refuse deletion, or null when nothing is in flight. */
async function findOpenOrders(
  admin: Awaited<ReturnType<typeof createSupabaseServerAdminClient>>,
  userId: string,
): Promise<string | null> {
  const { count: buying } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", userId)
    .in("status", OPEN_ORDER_STATUSES)

  if ((buying ?? 0) > 0) {
    return "You have orders that haven't been delivered yet. You can delete your account once they arrive."
  }

  const { data: seller } = await admin
    .from("seller_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (seller) {
    const { data: openItems } = await admin
      .from("order_items")
      .select("id, orders!inner(status)")
      .eq("seller_id", seller.id)
      .in("orders.status", OPEN_ORDER_STATUSES)
      .limit(1)

    if (openItems && openItems.length > 0) {
      return "You have sales that haven't been delivered yet. Fulfil them before deleting your account."
    }
  }

  return null
}

/**
 * Strip every personal field, release the email address, and lock the login.
 * Returns false if the auth user could not be locked — in that case the caller
 * must report failure rather than pretend the account is gone.
 */
async function anonymiseAccount(
  admin: Awaited<ReturnType<typeof createSupabaseServerAdminClient>>,
  userId: string,
): Promise<boolean> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    // Frees the original address for re-registration and removes it from auth.
    email: `deleted+${userId}@deleted.invalid`,
    email_confirm: true,
    // ~100 years — the same mechanism admin suspension uses.
    ban_duration: "876000h",
    user_metadata: {},
  })
  if (error) {
    console.error("deleteAccount: could not lock auth user", error.message)
    return false
  }

  await admin
    .from("profiles")
    .update({
      full_name: "Deleted account",
      avatar_url: null,
      bio: null,
      phone: null,
    })
    .eq("id", userId)

  await admin
    .from("seller_profiles")
    .update({
      business_name: "Closed storefront",
      description: null,
      logo_url: null,
      banner_url: null,
      website_url: null,
      instagram_url: null,
    })
    .eq("user_id", userId)

  return true
}
