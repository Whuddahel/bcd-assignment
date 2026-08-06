import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe/server"
import { hasStripe, appConfig } from "@/lib/config"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getProductsForCheckout } from "@/lib/data/products"

const requestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        // Every listing is a one-of-a-kind item, not stock — never more than 1.
        qty: z.literal(1),
      }),
    )
    .min(1),
  address: z.object({
    name: z.string().min(1),
    line1: z.string().min(1),
    city: z.string().min(1),
    postal: z.string().min(1),
    country: z.string().min(1),
  }),
})

type LineItem = {
  productId: string
  sellerId: string
  title: string
  price: number
  qty: number
}

type Resolved = { lineItems: LineItem[]; subtotal: number }

async function resolveFromSupabase(
  items: { productId: string; qty: number }[],
): Promise<Resolved | null> {
  const products = await getProductsForCheckout(items.map((i) => i.productId))

  const lineItems: LineItem[] = []
  for (const { productId, qty } of items) {
    const product = products.find((p) => p.id === productId)
    if (!product || product.status !== "active") return null
    lineItems.push({
      productId,
      sellerId: product.sellerId,
      title: product.title,
      price: product.price,
      qty,
    })
  }
  const subtotal = lineItems.reduce((n, i) => n + i.price * i.qty, 0)
  return { lineItems, subtotal }
}

export async function POST(request: Request) {
  if (!hasStripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on this environment." },
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 })
  }

  // Prices are always recomputed server-side — the client only supplies product ids + quantities.
  const resolved = await resolveFromSupabase(parsed.data.items)

  if (!resolved || resolved.subtotal <= 0) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to checkout." },
      { status: 401 },
    )
  }
  const buyerId = user.id

  const { lineItems, subtotal } = resolved
  const platformFee = Math.round(subtotal * (appConfig.stripe.platformFeePercent / 100))
  const total = subtotal + platformFee

  // Stored with Stripe's own shipping-address field names (name/line1/city/
  // postal_code/country), matching how Stripe itself shapes an address.
  const { name, line1, city, postal, country } = parsed.data.address
  const shippingAddress = { name, line1, city, postal_code: postal, country }

  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      // Consumed by the webhook to create the order + per-seller transfers.
      // Only ids + qty — Stripe caps each metadata value at 500 characters, so
      // title/price/sellerId are re-resolved from Supabase during fulfilment
      // instead of being carried through here.
      buyerId,
      lineItems: JSON.stringify(lineItems.map((i) => ({ productId: i.productId, qty: i.qty }))),
      subtotal: String(subtotal),
      platformFee: String(platformFee),
      shippingAddress: JSON.stringify(shippingAddress),
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    subtotal,
    platformFee,
    total,
  })
}
