import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe/server"
import { hasStripe, appConfig } from "@/lib/config"
import { createSupabaseServerAdminClient, createSupabaseServerClient } from "@/lib/supabase/server"

const requestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive().max(20),
      }),
    )
    .min(1),
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
  const supabase = await createSupabaseServerAdminClient()
  const ids = items.map((i) => i.productId)

  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, price, seller_id, status")
    .in("id", ids)

  if (error || !products) return null

  const lineItems: LineItem[] = []
  for (const { productId, qty } of items) {
    const product = products.find((p) => p.id === productId)
    if (!product || product.status !== "active") return null
    lineItems.push({
      productId,
      sellerId: product.seller_id,
      title: product.title,
      // products.price is stored in cents in Supabase; everywhere else in the
      // app (mock data, formatPrice, cart totals) works in whole dollars.
      price: product.price / 100,
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

  const stripe = getStripe()
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      // Consumed by the webhook to create the order + per-seller transfers.
      buyerId,
      lineItems: JSON.stringify(lineItems),
      subtotal: String(subtotal),
      platformFee: String(platformFee),
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    subtotal,
    platformFee,
    total,
  })
}
