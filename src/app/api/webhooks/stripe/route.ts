import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe/server"
import { useLiveData, appConfig } from "@/lib/config"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"

type WebhookLineItem = {
  productId: string
  sellerId: string
  title: string
  price: number
  qty: number
}

function parseLineItems(raw: string | undefined): WebhookLineItem[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed as WebhookLineItem[]
  } catch {
    return null
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (!useLiveData) return

  const buyerId = paymentIntent.metadata.buyerId
  const lineItems = parseLineItems(paymentIntent.metadata.lineItems)
  const subtotal = Number(paymentIntent.metadata.subtotal)
  const platformFee = Number(paymentIntent.metadata.platformFee)

  if (!buyerId || !lineItems || lineItems.length === 0) {
    console.error("stripe webhook: payment_intent.succeeded missing order metadata", paymentIntent.id)
    return
  }

  const supabase = await createSupabaseServerAdminClient()

  // Idempotent: Stripe may redeliver the same event.
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle()

  if (existingOrder) return

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      status: "confirmed",
      total_amount: subtotal + platformFee,
      platform_fee: platformFee,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_payment_status: paymentIntent.status,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    console.error("stripe webhook: failed to create order", orderError)
    return
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lineItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      seller_id: item.sellerId,
      title: item.title,
      price: item.price,
      quantity: item.qty,
    })),
  )

  if (itemsError) {
    console.error("stripe webhook: failed to create order_items", itemsError)
    return
  }

  await createSellerTransfers(paymentIntent, lineItems)
}

async function createSellerTransfers(
  paymentIntent: Stripe.PaymentIntent,
  lineItems: WebhookLineItem[],
) {
  const supabase = await createSupabaseServerAdminClient()
  const stripe = getStripe()

  const sellerIds = [...new Set(lineItems.map((i) => i.sellerId))]
  const { data: sellers } = await supabase
    .from("seller_profiles")
    .select("id, stripe_account_id, stripe_onboarding_complete")
    .in("id", sellerIds)

  if (!sellers) return

  const chargeId =
    typeof paymentIntent.latest_charge === "string"
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge?.id

  for (const sellerId of sellerIds) {
    const seller = sellers.find((s) => s.id === sellerId)
    if (!seller?.stripe_account_id || !seller.stripe_onboarding_complete) {
      // Seller hasn't completed Stripe Connect onboarding yet — payout is
      // held on the platform balance until they do (Connect onboarding step).
      console.warn(`stripe webhook: seller ${sellerId} has no connected payout account, skipping transfer`)
      continue
    }

    const sellerLineItems = lineItems.filter((i) => i.sellerId === sellerId)
    const sellerSubtotal = sellerLineItems.reduce((n, i) => n + i.price * i.qty, 0)
    const sellerFee = Math.round(sellerSubtotal * (appConfig.stripe.platformFeePercent / 100))
    const transferAmount = sellerSubtotal - sellerFee

    if (transferAmount <= 0) continue

    try {
      await stripe.transfers.create({
        amount: Math.round(transferAmount * 100),
        currency: "usd",
        destination: seller.stripe_account_id,
        source_transaction: chargeId,
        transfer_group: paymentIntent.id,
      })
    } catch (err) {
      console.error(`stripe webhook: transfer to seller ${sellerId} failed`, err)
    }
  }
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
