import { NextResponse } from "next/server"
import { useLiveData } from "@/lib/config"
import { getSessionUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
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
    .select("id, status, stripe_payment_intent_id, order_items(seller_id)")
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
    const message = err instanceof Error ? err.message : "Refund failed at Stripe."
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Update immediately for responsive UI; the charge.refunded webhook is the
  // source of truth and will set the same status if it arrives first/later.
  await admin
    .from("orders")
    .update({ status: "refunded", stripe_payment_status: "refunded" })
    .eq("id", order.id)

  return NextResponse.json({ ok: true })
}
