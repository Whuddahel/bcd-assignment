import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapTicket, type TicketVM } from "./types"

const TICKET_LIST_SELECT = "*, profiles!support_tickets_user_id_fkey(full_name)"
const TICKET_FULL_SELECT =
  "*, profiles!support_tickets_user_id_fkey(full_name), support_messages(*, profiles(full_name))"

/** Tickets opened by a specific customer. */
export async function getTicketsForUser(userId: string): Promise<TicketVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(TICKET_LIST_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error || !data) return []
  return data.map((t) => mapTicket(t as never))
}

/** All tickets, for the support/admin inbox. */
export async function getAllTickets(): Promise<TicketVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(TICKET_LIST_SELECT)
    .order("updated_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getAllTickets error:", error.message)
    return []
  }
  return data.map((t) => mapTicket(t as never))
}

export async function getTicketById(id: string): Promise<TicketVM | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(TICKET_FULL_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return mapTicket(data as never)
}
