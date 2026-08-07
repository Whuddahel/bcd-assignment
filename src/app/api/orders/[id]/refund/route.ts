import { NextResponse } from "next/server"
import { useLiveData } from "@/lib/config"
import { getSessionUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { notify } from "@/lib/data/notifications"
import { getStripe } from "@/lib/stripe/server"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!useLiveData) {
    return NextResponse.json(
      { error: "Refunds require a live Supabase + Stripe configuration." },
      { status: 503 },
    )
  }

  const { id: orderId } = await params

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const admin = await createSupabaseServerAdminClient()

  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, buyer_id, total_amount, stripe_payment_intent_id, order_items(seller_id)")
    .eq("id", orderId)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  // Authorization: platform admins may refund anything; a seller may refund
  // only orders that contain one of their own line items.
  let authorized = user.role === "admin"
  if (!authorized && user.role === "seller") {
    const { data: seller } = await admin
      .from("seller_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
    if (seller) {
      authorized = order.order_items.some((item) => item.seller_id === seller.id)
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "You cannot refund this order." }, { status: 403 })
  }

  if (order.status === "refunded") {
    return NextResponse.json({ error: "This order is already refunded." }, { status: 409 })
  }

  if (!order.stripe_payment_intent_id) {
    return NextResponse.json({ error: "This order has no captured payment to refund." }, { status: 400 })
  }

  const stripe = getStripe()
  try {
    await stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id })
  } catch (err) {
    const code = (err as { code?: string } | null)?.code
    const message = err instanceof Error ? err.message : "Refund failed at Stripe."
    // Stripe already agrees this charge is refunded (e.g. a retry after our own
    // DB write failed last time) — reconcile Supabase instead of erroring out.
    const alreadyRefunded = code === "charge_already_refunded" || /already been refunded/i.test(message)
    if (!alreadyRefunded) {
      return NextResponse.json({ error: message }, { status: 502 })
    }
  }

  // Claw back the seller payout(s). Transfers are created at order confirmation
  // (createSellerTransfers in fulfillment.tsx), before shipping/delivery — so
  // without this, a seller could refund their own order, the buyer gets their
  // money back, and the seller silently keeps the payout at the platform's
  // expense. Transfers for this order all share `transfer_group` = the
  // PaymentIntent id, so no separate column is needed to find them.
  try {
    const transfers = await stripe.transfers.list({
      transfer_group: order.stripe_payment_intent_id,
      limit: 100,
    })
    for (const transfer of transfers.data) {
      if (transfer.reversed) continue
      try {
        await stripe.transfers.createReversal(transfer.id)
      } catch (err) {
        console.error(`refund: failed to reverse transfer ${transfer.id} for order ${order.id}`, err)
      }
    }
  } catch (err) {
    console.error(`refund: failed to look up transfers to reverse for order ${order.id}`, err)
  }

  // Update immediately for responsive UI; the charge.refunded webhook is the
  // source of truth and will set the same status if it arrives first/later.
  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "refunded", stripe_payment_status: "refunded" })
    .eq("id", order.id)

  if (updateError) {
    console.error("refund: order refunded at Stripe but Supabase update failed", updateError.message)
    return NextResponse.json(
      { error: "Refunded at Stripe, but saving the order status failed. Try again to retry just the save." },
      { status: 500 },
    )
  }

  const shortId = order.id.slice(0, 8).toUpperCase()
  await notify({
    userId: order.buyer_id,
    type: "order_refunded",
    title: `Order #${shortId} refunded`,
    body: `$${(order.total_amount / 100).toFixed(2)} is on its way back to your original payment method.`,
    href: "/account/orders",
  })

  return NextResponse.json({ ok: true })
}
