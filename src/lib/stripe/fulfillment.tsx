import "server-only"
import type Stripe from "stripe"
import * as React from "react"
import { getStripe } from "@/lib/stripe/server"
import { appConfig } from "@/lib/config"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getProductsForCheckout } from "@/lib/data/products"
import { notify, getSellerOwnerIds } from "@/lib/data/notifications"
import { sendEmail } from "@/lib/email/client"
import OrderConfirmationEmail from "@/emails/order-confirmation"
import { env } from "@/lib/env"

// Shared order-fulfilment logic used by BOTH the Stripe webhook and the
// checkout success page. Making it idempotent (keyed on the PaymentIntent id)
// means an order is created exactly once no matter which path runs first — so
// orders still appear even when webhooks aren't wired up in a given environment.

export type FulfilLineItem = {
  productId: string
  sellerId: string
  title: string
  price: number // whole dollars
  qty: number
}

export type FulfilledOrder = { id: string; total_amount: number }

type MetadataLineItem = { productId: string; qty: number }

function parseMetadataLineItems(raw: string | undefined): MetadataLineItem[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MetadataLineItem[]) : null
  } catch {
    return null
  }
}

/**
 * Metadata only carries {productId, qty} (Stripe caps each value at 500
 * characters — title/price/sellerId wouldn't fit for larger carts). Re-fetch
 * the rest fresh from Supabase, same as the checkout route does when the
 * PaymentIntent is first created.
 */
async function resolveLineItems(metaItems: MetadataLineItem[]): Promise<FulfilLineItem[] | null> {
  const products = await getProductsForCheckout(metaItems.map((i) => i.productId))

  const lineItems: FulfilLineItem[] = []
  for (const { productId, qty } of metaItems) {
    const product = products.find((p) => p.id === productId)
    if (!product) return null
    lineItems.push({
      productId,
      sellerId: product.sellerId,
      title: product.title,
      price: product.price,
      qty,
    })
  }
  return lineItems
}

/**
 * Create the order + line items + seller transfers + confirmation email for a
 * succeeded PaymentIntent, unless an order already exists for it.
 * Returns the (new or existing) order, or null if the intent can't be fulfilled.
 */
export async function fulfilPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
): Promise<FulfilledOrder | null> {
  const buyerId = paymentIntent.metadata.buyerId
  const metaItems = parseMetadataLineItems(paymentIntent.metadata.lineItems)
  const subtotal = Number(paymentIntent.metadata.subtotal)
  const platformFee = Number(paymentIntent.metadata.platformFee)
  const shippingAddress = paymentIntent.metadata.shippingAddress
    ? JSON.parse(paymentIntent.metadata.shippingAddress)
    : null

  if (!buyerId || !metaItems || metaItems.length === 0) {
    console.error("fulfilment: payment intent missing order metadata", paymentIntent.id)
    return null
  }

  const lineItems = await resolveLineItems(metaItems)
  if (!lineItems || lineItems.length === 0) {
    console.error("fulfilment: could not resolve line items from Supabase", paymentIntent.id)
    return null
  }

  const supabase = await createSupabaseServerAdminClient()

  // Idempotency guard — Stripe can redeliver, and the success page + webhook may race.
  const { data: existing } = await supabase
    .from("orders")
    .select("id, total_amount")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle()

  if (existing) return existing

  // Claim every item atomically BEFORE creating the order. Each listing is
  // one-of-a-kind — two buyers can both have it in cart and both pay, since
  // Stripe doesn't know about our inventory — so this conditional UPDATE
  // (`eq("status", "active")`) is the actual point of truth for "did I win the
  // item," not the `products.status !== "active"` check at PaymentIntent
  // creation time (api/checkout/route.ts), which only blocks the obvious case
  // and can't see a concurrent payment that's already in flight.
  const { data: claimed } = await supabase
    .from("products")
    .update({ status: "sold" })
    .in("id", lineItems.map((item) => item.productId))
    .eq("status", "active")
    .select("id")

  const claimedIds = new Set((claimed ?? []).map((p) => p.id))
  const lostItems = lineItems.filter((item) => !claimedIds.has(item.productId))

  if (lostItems.length > 0) {
    // Before concluding we lost to another buyer: this could just be the
    // *same* PaymentIntent's own concurrent fulfilment call (the webhook and
    // the checkout success page both call fulfilPaymentIntent, and can race
    // each other) — in which case the other call already claimed these exact
    // items for this same order and already created it. That's success, not
    // a lost race; re-check before refunding a buyer's legitimate purchase.
    const { data: raced } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .maybeSingle()
    if (raced) return raced

    // Release whatever we did manage to claim — we're not fulfilling a partial
    // order for a one-of-a-kind marketplace, so this payment can't go through.
    if (claimedIds.size > 0) {
      await supabase.from("products").update({ status: "active" }).in("id", [...claimedIds])
    }

    const stripe = getStripe()
    try {
      await stripe.refunds.create({ payment_intent: paymentIntent.id })
    } catch (err) {
      console.error(`fulfilment: failed to auto-refund lost race for ${paymentIntent.id}`, err)
    }

    await notify({
      userId: buyerId,
      type: "payment_failed",
      title: "An item in your order sold out",
      body: `${lostItems.map((i) => i.title).join(", ")} sold to another buyer moments before your payment cleared. You've been refunded in full.`,
      href: "/browse",
    })

    console.warn(`fulfilment: lost race on ${lostItems.length} item(s) for intent ${paymentIntent.id}, refunded`)
    return null
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      status: "confirmed",
      total_amount: Math.round((subtotal + platformFee) * 100),
      platform_fee: Math.round(platformFee * 100),
      stripe_payment_intent_id: paymentIntent.id,
      stripe_payment_status: paymentIntent.status,
      shipping_address: shippingAddress,
    })
    .select("id, total_amount")
    .single()

  if (orderError || !order) {
    // A unique-violation here means a concurrent path already created it — treat as success.
    const { data: raced } = await supabase
      .from("orders")
      .select("id, total_amount")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .maybeSingle()
    if (raced) return raced
    console.error("fulfilment: failed to create order", orderError)
    return null
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lineItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      seller_id: item.sellerId,
      title: item.title,
      price: Math.round(item.price * 100),
      quantity: item.qty,
    })),
  )
  if (itemsError) console.error("fulfilment: failed to create order_items", itemsError)

  await createSellerTransfers(paymentIntent, lineItems)
  await sendOrderConfirmation(buyerId, order.id, order.total_amount, lineItems)
  await notifyOrderPlaced(buyerId, order.id, order.total_amount, lineItems)

  return order
}

/** In-app notifications for both sides of a completed purchase. */
async function notifyOrderPlaced(
  buyerId: string,
  orderId: string,
  totalAmountCents: number,
  lineItems: FulfilLineItem[],
) {
  const shortId = orderId.slice(0, 8).toUpperCase()
  const itemSummary =
    lineItems.length === 1
      ? lineItems[0].title
      : `${lineItems[0].title} + ${lineItems.length - 1} more`

  const owners = await getSellerOwnerIds(lineItems.map((i) => i.sellerId))

  await notify([
    {
      userId: buyerId,
      type: "order_confirmed",
      title: `Order #${shortId} confirmed`,
      body: `${itemSummary} · $${(totalAmountCents / 100).toFixed(2)}. We'll let you know when it ships.`,
      href: "/account/orders",
    },
    ...[...new Set(lineItems.map((i) => i.sellerId))].flatMap((sellerId) => {
      const ownerId = owners.get(sellerId)
      if (!ownerId) return []

      const sold = lineItems.filter((i) => i.sellerId === sellerId)
      const revenue = sold.reduce((sum, i) => sum + i.price * i.qty, 0)
      return [
        {
          userId: ownerId,
          type: "new_sale" as const,
          title: sold.length === 1 ? `${sold[0].title} sold` : `${sold.length} items sold`,
          body: `Order #${shortId} · $${revenue.toFixed(2)}. Ship it to keep the buyer in the loop.`,
          href: "/seller/orders",
        },
      ]
    }),
  ])
}

/** Retrieve a PaymentIntent from Stripe and fulfil it if it has succeeded. */
export async function fulfilPaymentIntentById(
  paymentIntentId: string,
  expectedBuyerId?: string,
): Promise<FulfilledOrder | null> {
  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (paymentIntent.status !== "succeeded") return null
  // Guard: a signed-in user may only fulfil their own intent.
  if (expectedBuyerId && paymentIntent.metadata.buyerId !== expectedBuyerId) return null

  return fulfilPaymentIntent(paymentIntent)
}

async function createSellerTransfers(
  paymentIntent: Stripe.PaymentIntent,
  lineItems: FulfilLineItem[],
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
      console.warn(`fulfilment: seller ${sellerId} not onboarded to Connect, holding payout`)
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
      console.error(`fulfilment: transfer to seller ${sellerId} failed`, err)
    }
  }
}

async function sendOrderConfirmation(
  buyerId: string,
  orderId: string,
  totalAmountCents: number,
  lineItems: FulfilLineItem[],
) {
  try {
    const supabase = await createSupabaseServerAdminClient()
    const { data: authUser } = await supabase.auth.admin.getUserById(buyerId)
    if (!authUser?.user?.email) return

    await sendEmail({
      to: authUser.user.email,
      subject: `Your Aureon order #${orderId.slice(0, 8)} is confirmed!`,
      react: (
        <OrderConfirmationEmail
          orderId={orderId.slice(0, 8)}
          totalAmount={`$${(totalAmountCents / 100).toFixed(2)}`}
          items={lineItems.map((item) => ({ title: item.title, quantity: item.qty }))}
          siteUrl={env.NEXT_PUBLIC_APP_URL}
        />
      ),
    })
  } catch (err) {
    console.error("fulfilment: failed to send confirmation email", err)
  }
}
