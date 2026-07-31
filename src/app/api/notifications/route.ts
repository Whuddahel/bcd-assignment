import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getNotifications } from "@/lib/data/notifications"

export async function GET() {
  const user = await getSessionUser()
  if (!user || user.isMock) return NextResponse.json({ notifications: [] })

  const rows = await getNotifications(user.id)

  // Map DB rows into the client store shape.
  const notifications = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body ?? "",
    href: n.href ?? undefined,
    readAt: n.read ? n.created_at : null,
    createdAt: n.created_at,
  }))

  return NextResponse.json({ notifications })
}
