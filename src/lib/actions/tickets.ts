"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
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
  const { error } = await supabase.from("support_messages").insert({
    ticket_id: parsed.data.ticketId,
    sender_id: user.id,
    body: parsed.data.body,
    is_internal: isInternal,
  })
  if (error) return { ok: false, error: error.message }

  // Touch the ticket so it re-sorts to the top of the inbox.
  await supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", parsed.data.ticketId)

  revalidatePath(`/support/tickets/${parsed.data.ticketId}`)
  revalidatePath("/support")
  return { ok: true, message: "Reply sent." }
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
  const { error } = await supabase
    .from("support_tickets")
    .update({ status, assigned_to: user.id })
    .eq("id", ticketId)

  if (error) return { ok: false, error: error.message }
  revalidatePath(`/support/tickets/${ticketId}`)
  revalidatePath("/support")
  return { ok: true, message: "Status updated." }
}
