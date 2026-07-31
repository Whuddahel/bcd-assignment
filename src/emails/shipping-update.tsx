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
} from "@react-email/components"
import * as React from "react"

export interface ShippingUpdateEmailProps {
  orderId: string
  siteUrl: string
}

export function ShippingUpdateEmail({
  orderId = "1234abcd",
  siteUrl = "http://localhost:3000",
}: ShippingUpdateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Aureon order #{orderId} has shipped!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Order is on the Way</Heading>
          <Text style={text}>
            Great news! Order #{orderId} has been marked as shipped by the seller.
          </Text>
          <Text style={text}>
            You can check the status of your order from your account dashboard.
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={`${siteUrl}/account/orders`}>
              Track Order
            </Link>
          </Section>
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

export default ShippingUpdateEmail
