import "server-only"
import type Stripe from "stripe"
import * as React from "react"
import { getStripe } from "@/lib/stripe/server"
import { appConfig } from "@/lib/config"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getProductsForCheckout } from "@/lib/data/products"
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

  return order
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
