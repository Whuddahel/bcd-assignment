"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import { notify, getStaffUserIds } from "@/lib/data/notifications"
import type { TicketStatus } from "@/types/database"

export type ActionResult =
  | { ok: true; message?: string; ticketId?: string }
  | { ok: false; error: string }

const STAFF = ["support", "admin"] as const

// ── Customer: open a ticket ───────────────────────────────────────────────────

const createSchema = z.object({
  subject: z.string().min(4, "Subject is too short").max(200),
  body: z.string().min(10, "Please describe your issue").max(4000),
  orderId: z.string().uuid().optional(),
})

export async function createTicket(input: z.input<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid ticket." }

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "Please sign in to contact support." }

  const supabase = await createSupabaseServerClient()
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({ user_id: user.id, subject: parsed.data.subject, order_id: parsed.data.orderId ?? null })
    .select("id")
    .single()

  if (error || !ticket) return { ok: false, error: error?.message ?? "Could not open ticket." }

  await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    body: parsed.data.body,
    is_internal: false,
  })

  await notify(
    (await getStaffUserIds(["support", "admin"]))
      .filter((id) => id !== user.id)
      .map((id) => ({
        userId: id,
        type: "new_message" as const,
        title: `New support ticket: ${parsed.data.subject}`,
        body: parsed.data.body.length > 90 ? `${parsed.data.body.slice(0, 90)}…` : parsed.data.body,
        href: `/support/tickets/${ticket.id}`,
      })),
  )

  revalidatePath("/support")
  return { ok: true, message: "Ticket opened.", ticketId: ticket.id }
}

// ── Reply to a ticket (customer or staff) ─────────────────────────────────────

const replySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1, "Message cannot be empty").max(4000),
  isInternal: z.boolean().optional().default(false),
})

export async function replyToTicket(input: z.input<typeof replySchema>): Promise<ActionResult> {
  const parsed = replySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reply." }

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "Please sign in." }

  const isStaff = (STAFF as readonly string[]).includes(user.role)
  // Only staff may post internal notes.
  const isInternal = Boolean(parsed.data.isInternal) && isStaff

  const supabase = await createSupabaseServerClient()

  const { data: ticketBefore } = await supabase
    .from("support_tickets")
    .select("status, user_id")
    .eq("id", parsed.data.ticketId)
    .maybeSingle()

  const { error } = await supabase.from("support_messages").insert({
    ticket_id: parsed.data.ticketId,
    sender_id: user.id,
    body: parsed.data.body,
    is_internal: isInternal,
  })
  if (error) return { ok: false, error: error.message }

  // A customer replying to their own resolved ticket means it needs another
  // look — otherwise it sits marked "Resolved" while genuinely still open.
  const shouldReopen =
    !isStaff && ticketBefore?.user_id === user.id && ticketBefore?.status === "resolved"

  // Touch the ticket so it re-sorts to the top of the inbox.
  await supabase
    .from("support_tickets")
    .update({
      updated_at: new Date().toISOString(),
      ...(shouldReopen ? { status: "open" as TicketStatus } : {}),
    })
    .eq("id", parsed.data.ticketId)

  // Internal notes are staff-only scratch space — nobody gets pinged for them.
  if (!isInternal) {
    await notifyTicketReply(parsed.data.ticketId, user.id, isStaff, parsed.data.body)
  }

  revalidatePath(`/support/tickets/${parsed.data.ticketId}`)
  revalidatePath("/support")
  return { ok: true, message: "Reply sent." }
}

/**
 * Ping whoever is waiting on the other end of the thread: the customer when
 * staff replies, and the assigned agent (or the whole support desk, while the
 * ticket is unassigned) when the customer does.
 */
async function notifyTicketReply(
  ticketId: string,
  senderId: string,
  senderIsStaff: boolean,
  body: string,
) {
  const supabase = await createSupabaseServerClient()
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, subject, user_id, assigned_to")
    .eq("id", ticketId)
    .maybeSingle()

  if (!ticket) return

  const preview = body.length > 90 ? `${body.slice(0, 90)}…` : body

  if (senderIsStaff) {
    if (ticket.user_id === senderId) return
    await notify({
      userId: ticket.user_id,
      type: "new_message",
      title: `Support replied: ${ticket.subject}`,
      body: preview,
      href: `/account/support/${ticket.id}`,
    })
    return
  }

  const recipients = ticket.assigned_to
    ? [ticket.assigned_to]
    : await getStaffUserIds(["support", "admin"])

  await notify(
    recipients
      .filter((id) => id !== senderId)
      .map((id) => ({
        userId: id,
        type: "new_message" as const,
        title: `New reply on: ${ticket.subject}`,
        body: preview,
        href: `/support/tickets/${ticket.id}`,
      })),
  )
}

// ── Staff: change ticket status ───────────────────────────────────────────────

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<ActionResult> {
  const user = await getSessionUser()
  if (!user || !(STAFF as readonly string[]).includes(user.role)) {
    return { ok: false, error: "Not authorized." }
  }

  const supabase = await createSupabaseServerClient()

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, subject, user_id, assigned_to")
    .eq("id", ticketId)
    .maybeSingle()
  if (!ticket) return { ok: false, error: "Ticket not found." }

  // Claim the ticket if nobody's on it yet; don't silently steal it from
  // whoever is already handling it just because a second agent touched it.
  const { error } = await supabase
    .from("support_tickets")
    .update({ status, assigned_to: ticket.assigned_to ?? user.id })
    .eq("id", ticketId)

  if (error) return { ok: false, error: error.message }

  // Resolving/closing without a reply (e.g. "resolved, no action needed")
  // otherwise leaves the customer with no signal their ticket moved at all.
  if ((status === "resolved" || status === "closed") && ticket.user_id !== user.id) {
    await notify({
      userId: ticket.user_id,
      type: "new_message",
      title: `Ticket ${status}: ${ticket.subject}`,
      body: status === "resolved"
        ? "Support marked your ticket as resolved. Reply if you still need help."
        : "Your support ticket has been closed.",
      href: `/account/support/${ticket.id}`,
    })
  }

  revalidatePath(`/support/tickets/${ticketId}`)
  revalidatePath("/support")
  return { ok: true, message: "Status updated." }
}
