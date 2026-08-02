import { NextResponse } from "next/server"
import { useLiveData, hasStripe } from "@/lib/config"
import { createSupabaseServerAdminClient, createSupabaseServerClient } from "@/lib/supabase/server"
import { fulfilPaymentIntentById } from "@/lib/stripe/fulfillment"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!useLiveData) {
    return NextResponse.json({ error: "Live order data is not enabled." }, { status: 503 })
  }

  const { id: paymentIntentId } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const admin = await createSupabaseServerAdminClient()

  const ORDER_COLS = "id, buyer_id, status, total_amount, platform_fee, stripe_payment_status, created_at"

  async function lookup() {
    return admin.from("orders").select(ORDER_COLS).eq("stripe_payment_intent_id", paymentIntentId).maybeSingle()
  }

  let { data: order, error } = await lookup()

  if (error) {
    return NextResponse.json({ error: "Failed to look up order." }, { status: 500 })
  }

  // If the webhook hasn't created the order yet (or isn't wired up in this
  // environment), fulfil it ourselves straight from Stripe. Idempotent, and
  // only fulfils the signed-in user's own PaymentIntent.
  if (!order && hasStripe) {
    try {
      await fulfilPaymentIntentById(paymentIntentId, user.id)
      ;({ data: order } = await lookup())
    } catch (err) {
      console.error("by-payment-intent: fulfilment attempt failed", err)
    }
  }

  // Still nothing means the payment hasn't succeeded yet — not an error.
  if (!order) {
    return NextResponse.json({ order: null }, { status: 200 })
  }

  if (order.buyer_id !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  const { data: items } = await admin
    .from("order_items")
    .select("id, product_id, title, price, quantity")
    .eq("order_id", order.id)

  return NextResponse.json({ order: { ...order, items: items ?? [] } })
}
