import { NextResponse } from "next/server"
import { useLiveData } from "@/lib/config"
import { getSessionUser } from "@/lib/auth/session"
import { createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { notify } from "@/lib/data/notifications"
import { sendEmail } from "@/lib/email/client"
import SellerApprovalEmail from "@/emails/seller-approval"
import { env } from "@/lib/env"
import * as React from "react"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!useLiveData) {
    return NextResponse.json(
      { error: "Seller verification requires a live configuration." },
      { status: 503 },
    )
  }

  const { id: sellerId } = await params

  const user = await getSessionUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
  }

  const admin = await createSupabaseServerAdminClient()

  const { data: seller, error } = await admin
    .from("seller_profiles")
    .select("id, business_name, user_id, verified")
    .eq("id", sellerId)
    .maybeSingle()

  if (error || !seller) {
    return NextResponse.json({ error: "Seller not found." }, { status: 404 })
  }

  if (seller.verified) {
    return NextResponse.json({ ok: true }) // Already verified
  }

  const { error: updateError } = await admin
    .from("seller_profiles")
    .update({ verified: true })
    .eq("id", seller.id)

  if (updateError) {
    return NextResponse.json({ error: "Failed to verify seller." }, { status: 500 })
  }

  await notify({
    userId: seller.user_id,
    type: "seller_approved",
    title: "Your seller account is verified",
    body: `${seller.business_name} now carries the verified badge. Your listings can go live.`,
    href: "/seller",
  })

  try {
    const { data: authUser } = await admin.auth.admin.getUserById(seller.user_id)
    if (authUser && authUser.user?.email) {
      await sendEmail({
        to: authUser.user.email,
        subject: "Your seller account is approved!",
        react: <SellerApprovalEmail businessName={seller.business_name} siteUrl={env.NEXT_PUBLIC_APP_URL} />,
      })
    }
  } catch (err) {
    // Non-critical: Log error but do not fail the request
    console.error("Failed to send seller approval email:", err)
  }

  return NextResponse.json({ ok: true })
}
