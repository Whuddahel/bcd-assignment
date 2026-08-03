import { NextResponse } from "next/server"
import { useLiveData } from "@/lib/config"
import { getSessionUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/client"
import ShippingUpdateEmail from "@/emails/shipping-update"
import { env } from "@/lib/env"
import { isBlockchainConfigured } from "@/lib/blockchain/config"
import { transferToBuyer } from "@/lib/blockchain/server"
import * as React from "react"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!useLiveData) {
    return NextResponse.json(
      { error: "Order status updates require a live configuration." },
      { status: 503 },
    )
  }

  const { id: orderId } = await params

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const { status } = await request.json()
  
  if (status !== "shipped" && status !== "delivered") {
    return NextResponse.json({ error: "Invalid status update." }, { status: 400 })
  }

  const admin = await createSupabaseServerAdminClient()

  // Verify authorization (admin, or seller of the order)
  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, buyer_id, order_items(seller_id)")
    .eq("id", orderId)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

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
    return NextResponse.json({ error: "You cannot update this order." }, { status: 403 })
  }

  // Update order
  const { error: updateError } = await admin
    .from("orders")
    .update({ status })
    .eq("id", order.id)

  if (updateError) {
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 })
  }

  // If status is 'shipped', send email to buyer
  if (status === "shipped") {
    try {
      const { data: buyer } = await admin
        .from("profiles")
        .select("id, email:users(email)")
      
      const { data: authUser } = await admin.auth.admin.getUserById(order.buyer_id)
      
      if (authUser && authUser.user?.email) {
        await sendEmail({
          to: authUser.user.email,
          subject: `Your order #${order.id.slice(0, 8)} has shipped!`,
          react: <ShippingUpdateEmail orderId={order.id.slice(0, 8)} siteUrl={env.NEXT_PUBLIC_APP_URL} />,
        })
      }
    } catch (err) {
      // Non-critical: Log error but do not fail the request
      console.error("Failed to send shipping update email:", err)
    }
  }

  // On delivery, record the ownership transfer on-chain for every minted item in
  // the order. Non-critical: a chain hiccup must not block the status update.
  if (status === "delivered" && isBlockchainConfigured) {
    try {
      const { data: lineItems } = await admin
        .from("order_items")
        .select("product_id, products(blockchain_token_id)")
        .eq("order_id", order.id)

      for (const item of lineItems ?? []) {
        const tokenId = (item.products as { blockchain_token_id?: string | null } | null)
          ?.blockchain_token_id
        if (!tokenId) continue
        try {
          await transferToBuyer(tokenId, order.buyer_id)
        } catch (err) {
          console.error(`Failed to transfer token ${tokenId} on delivery:`, err)
        }
      }
    } catch (err) {
      console.error("Blockchain transfer on delivery failed:", err)
    }
  }

  return NextResponse.json({ ok: true })
}
