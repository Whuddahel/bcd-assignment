import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components"
import * as React from "react"

export interface OrderConfirmationEmailProps {
  orderId: string
  totalAmount: string
  items: { title: string; quantity: number }[]
  siteUrl: string
}

export function OrderConfirmationEmail({
  orderId = "1234abcd",
  totalAmount = "$120.00",
  items = [{ title: "Rolex Submariner", quantity: 1 }],
  siteUrl = "http://localhost:3000",
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Aureon order #{orderId} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmed</Heading>
          <Text style={text}>
            Thank you for your purchase! We've received your order and are getting it ready.
          </Text>
          
          <Section style={detailsContainer}>
            <Text style={detailText}><strong>Order #:</strong> {orderId}</Text>
            <Text style={detailText}><strong>Total Amount:</strong> {totalAmount}</Text>
            
            <Hr style={hr} />
            
            <Text style={detailText}><strong>Items:</strong></Text>
            {items.map((item, idx) => (
              <Text key={idx} style={detailText}>
                {item.title} <span style={{ color: "#666" }}>x{item.quantity}</span>
              </Text>
            ))}
          </Section>

          <Section style={btnContainer}>
            <Link style={button} href={`${siteUrl}/account/orders`}>
              View Order Details
            </Link>
          </Section>

          <Text style={text}>
            We'll send you another email as soon as your items ship.
          </Text>
          <Text style={text}>
            Best,<br />
            The Aureon Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
  textAlign: "center" as const,
}

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 40px",
}

const detailsContainer = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  margin: "20px 40px",
  borderRadius: "8px",
}

const detailText = {
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "4px 0",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
}

const btnContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const button = {
  backgroundColor: "#8b5cf6",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}

export default OrderConfirmationEmail
