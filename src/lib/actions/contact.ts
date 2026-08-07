"use server"

import * as React from "react"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import { sendEmail } from "@/lib/email/client"
import { notify, getStaffUserIds } from "@/lib/data/notifications"

export type ContactResult = { ok: true; message: string } | { ok: false; error: string }

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.email("Enter a valid email"),
  subject: z.string().min(1).max(200),
  message: z.string().min(10, "Please add a bit more detail").max(4000),
})

export type ContactInput = z.input<typeof schema>

const SUPPORT_INBOX = "support@aureon.io"

/**
 * Contact form handler.
 * - Signed-in users get a real support ticket (visible in the support inbox).
 * - Anonymous users trigger a notification email to the support inbox.
 */
export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" }
  const d = parsed.data

  const user = await getSessionUser()

  if (user && !user.isMock) {
    const supabase = await createSupabaseServerClient()
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject: d.subject })
      .select("id")
      .single()

    if (error || !ticket) return { ok: false, error: error?.message ?? "Could not open a ticket." }

    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      body: d.message,
      is_internal: false,
    })

    await notify(
      (await getStaffUserIds(["support", "admin"]))
        .filter((id) => id !== user.id)
        .map((id) => ({
          userId: id,
          type: "new_message" as const,
          title: `New support ticket: ${d.subject}`,
          body: d.message.length > 90 ? `${d.message.slice(0, 90)}…` : d.message,
          href: `/support/tickets/${ticket.id}`,
        })),
    )

    revalidatePath("/support")
    return { ok: true, message: "Thanks — we've opened a support ticket and will reply shortly." }
  }

  // Anonymous: notify the support inbox by email (no-op + logged if Resend is unset).
  await sendEmail({
    to: SUPPORT_INBOX,
    replyTo: d.email,
    subject: `[Contact] ${d.subject}`,
    react: React.createElement(
      "div",
      null,
      React.createElement("p", null, `From: ${d.name} <${d.email}>`),
      React.createElement("p", null, `Subject: ${d.subject}`),
      React.createElement("p", null, d.message),
    ),
  })

  return { ok: true, message: "Thanks — your message is on its way to our team." }
}
