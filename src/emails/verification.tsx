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

interface VerificationEmailProps {
  confirmationUrl: string
}

export function VerificationEmail({ confirmationUrl = "http://localhost:3000/auth/confirm?..." }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Aureon account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Confirm your Aureon account</Heading>
          <Text style={text}>
            Welcome to Aureon. Click the link below to verify your email and activate your account.
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={confirmationUrl}>
              Confirm my account
            </Link>
          </Section>
          <Text style={text}>
            If you did not sign up for an account, you can safely ignore this email.
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

export default VerificationEmail
