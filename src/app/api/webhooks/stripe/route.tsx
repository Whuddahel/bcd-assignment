import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe/server"
import { useLiveData } from "@/lib/config"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { fulfilPaymentIntent } from "@/lib/stripe/fulfillment"

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (!useLiveData) return
  await fulfilPaymentIntent(paymentIntent)
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!useLiveData) return
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id
  if (!paymentIntentId) return

  const supabase = await createSupabaseServerAdminClient()
  await supabase
    .from("orders")
    .update({ status: "refunded", stripe_payment_status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId)
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
      break
    case "charge.refunded":
      await handleChargeRefunded(event.data.object)
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}
