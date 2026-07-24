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

interface WelcomeEmailProps {
  name: string
  siteUrl: string
}

export function WelcomeEmail({ name = "there", siteUrl = "http://localhost:3000" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Aureon!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Aureon</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            We're thrilled to have you here. You can now browse our rare collectibles, save your favorites, and place orders.
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={siteUrl}>
              Start Exploring
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

export default WelcomeEmail
