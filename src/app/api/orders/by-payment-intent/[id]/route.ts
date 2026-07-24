import { NextResponse } from "next/server"
import { useLiveData } from "@/lib/config"
import { createSupabaseServerAdminClient, createSupabaseServerClient } from "@/lib/supabase/server"

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
  const { data: order, error } = await admin
    .from("orders")
    .select("id, buyer_id, status, total_amount, platform_fee, stripe_payment_status, created_at")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: "Failed to look up order." }, { status: 500 })
  }

  // Not found yet is expected right after payment — Stripe's webhook can
  // lag a second or two behind the browser redirect. Not an error.
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
