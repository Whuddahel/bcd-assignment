import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getNotifications } from "@/lib/data/notifications"
import { createSupabaseServerClient } from "@/lib/supabase/server"

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

/**
 * Mark notifications as read. Body: `{ ids: string[] }` for specific rows, or
 * `{}` for the whole inbox. RLS scopes the update to the caller's own rows, so
 * the user's session client is all that's needed here.
 */
export async function PATCH(request: Request) {
  const user = await getSessionUser()
  if (!user || user.isMock) return NextResponse.json({ ok: true })

  let ids: string[] | undefined
  try {
    const body = (await request.json()) as { ids?: unknown }
    if (Array.isArray(body.ids)) ids = body.ids.filter((id): id is string => typeof id === "string")
  } catch {
    // No body — treat as "mark everything read".
  }

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (ids && ids.length > 0) query = query.in("id", ids)

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
