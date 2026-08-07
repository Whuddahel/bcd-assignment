import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe/server"
import { useLiveData } from "@/lib/config"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { fulfilPaymentIntent } from "@/lib/stripe/fulfillment"
import { notify } from "@/lib/data/notifications"

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (!useLiveData) return
  await fulfilPaymentIntent(paymentIntent)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  if (!useLiveData) return
  const buyerId = paymentIntent.metadata.buyerId
  if (!buyerId) return

  await notify({
    userId: buyerId,
    type: "payment_failed",
    title: "Your payment didn't go through",
    body: "We couldn't process your card. Please try again from your cart.",
    href: "/checkout",
  })
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!useLiveData) return
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) return

  const supabase = await createSupabaseServerAdminClient()

  // Check the status *before* this update: the in-app refund route
  // (src/app/api/orders/[id]/refund/route.ts) sets status to "refunded"
  // synchronously and sends its own notification before Stripe's webhook has a
  // chance to arrive. Only notify here if this webhook is the first to see the
  // refund — i.e. one issued directly from the Stripe dashboard.
  const { data: before } = await supabase
    .from("orders")
    .select("id, buyer_id, total_amount, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle()

  if (!before) return
  const alreadyRefunded = before.status === "refunded"

  await supabase
    .from("orders")
    .update({ status: "refunded", stripe_payment_status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId)

  if (!alreadyRefunded) {
    const shortId = before.id.slice(0, 8).toUpperCase()
    await notify({
      userId: before.buyer_id,
      type: "order_refunded",
      title: `Order #${shortId} refunded`,
      body: `$${(before.total_amount / 100).toFixed(2)} is on its way back to your original payment method.`,
      href: "/account/orders",
    })
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 })
  }

  const rawBody = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature"
    console.error("stripe webhook: signature verification failed", message)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object)
      break
    case "payment_intent.payment_failed":
      console.warn("stripe webhook: payment failed", event.data.object.id)
      await handlePaymentFailed(event.data.object)
      break
    case "charge.refunded":
      await handleChargeRefunded(event.data.object)
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}
