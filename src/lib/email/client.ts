import { Resend } from "resend"
import { env } from "@/lib/env"
import * as React from "react"

const resend = new Resend(env.RESEND_API_KEY)

interface SendEmailParams {
  to: string | string[]
  subject: string
  react: React.ReactElement | React.ReactNode
  replyTo?: string | string[]
}

export async function sendEmail({ to, subject, react, replyTo }: SendEmailParams) {
  if (!env.RESEND_API_KEY) {
    console.warn("sendEmail: RESEND_API_KEY is missing. Email will not be sent.")
    console.warn(`Subject: ${subject} | To: ${to}`)
    return { error: "Missing RESEND_API_KEY" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Aureon <${env.RESEND_FROM_EMAIL}>`,
      to,
      subject,
      replyTo,
      react,
    })

    if (error) {
      console.error("sendEmail: error sending email via Resend:", error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error("sendEmail: unexpected error:", error)
    return { error }
  }
}
