import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/session"
import { getTicketById } from "@/lib/data/tickets"
import { TicketDetail } from "./ticket-detail"

export const metadata: Metadata = { title: "Ticket" }

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser(["support", "admin"])
  const { id } = await params
  const ticket = await getTicketById(id)
  if (!ticket) notFound()
  return <TicketDetail ticket={ticket} />
}
