import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Notification } from "@/types/database"

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  return count ?? 0
}
