import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/client"
import WelcomeEmail from "@/emails/welcome"
import VerificationEmail from "@/emails/verification"
import OrderConfirmationEmail from "@/emails/order-confirmation"
import ShippingUpdateEmail from "@/emails/shipping-update"
import SellerApprovalEmail from "@/emails/seller-approval"
import SupportReplyEmail from "@/emails/support-reply"
import { env } from "@/lib/env"
import * as React from "react"

export async function GET(request: Request) {
  if (env.NEXT_PUBLIC_DEVELOPMENT_MODE === false) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const template = searchParams.get("template")
  const to = searchParams.get("to") ?? "test@example.com"

  if (!template) {
    return NextResponse.json({
      availableTemplates: [
        "welcome",
        "verification",
        "order-confirmation",
        "shipping-update",
        "seller-approval",
        "support-reply",
      ],
      usage: "?template=welcome&to=your@email.com",
    })
  }

  let reactElement: React.ReactElement | null = null
  let subject = "Test Email"

  switch (template) {
    case "welcome":
      reactElement = <WelcomeEmail name="Test User" siteUrl={env.NEXT_PUBLIC_APP_URL} />
      subject = "Welcome to Aureon"
      break
    case "verification":
      reactElement = <VerificationEmail confirmationUrl={`${env.NEXT_PUBLIC_APP_URL}/auth/confirm?token=test`} />
      subject = "Verify your account"
      break
    case "order-confirmation":
      reactElement = (
        <OrderConfirmationEmail
          orderId="test-order-123"
          totalAmount="$120.00"
          items={[{ title: "Test Item", quantity: 2 }]}
          siteUrl={env.NEXT_PUBLIC_APP_URL}
        />
      )
      subject = "Order Confirmed"
      break
    case "shipping-update":
      reactElement = <ShippingUpdateEmail orderId="test-order-123" siteUrl={env.NEXT_PUBLIC_APP_URL} />
      subject = "Your order has shipped"
      break
    case "seller-approval":
      reactElement = <SellerApprovalEmail businessName="Test Store" siteUrl={env.NEXT_PUBLIC_APP_URL} />
      subject = "Seller Account Approved"
      break
    case "support-reply":
      reactElement = (
        <SupportReplyEmail
          ticketId="tk-test-123"
          subject="Help with login"
          replyBody="This is a test reply from support."
          siteUrl={env.NEXT_PUBLIC_APP_URL}
        />
      )
      subject = "Update on your ticket"
      break
    default:
      return NextResponse.json({ error: "Unknown template" }, { status: 400 })
  }

  try {
    const result = await sendEmail({ to, subject, react: reactElement })
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("test-email route error:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
