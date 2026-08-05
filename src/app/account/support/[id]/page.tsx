import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/session"
import { getTicketById } from "@/lib/data/tickets"
import { MyTicketDetail } from "./my-ticket-detail"

export const metadata: Metadata = { title: "Support Ticket" }

export default async function MyTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params

  // RLS scopes this to tickets the signed-in user owns — anyone else's id
  // (or a bad id) resolves to null here, same as a 404.
  const ticket = await getTicketById(id)
  if (!ticket) notFound()

  return <MyTicketDetail ticket={ticket} />
}
