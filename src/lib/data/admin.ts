import "server-only"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { mapProduct, type ProductVM, type ProductRow } from "./types"
import type { UserRole } from "@/types/database"

const PRODUCT_SELECT =
  "*, product_images(url,sort_order,is_primary), seller_profiles(business_name,verified,logo_url), categories(name,slug)"

/** All products regardless of status (admin/support only — RLS enforces this). */
export async function getAllProductsAdmin(): Promise<ProductVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getAllProductsAdmin error:", error.message)
    return []
  }
  return (data as unknown as ProductRow[]).map(mapProduct)
}

export type AdminUser = {
  id: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  createdAt: string
  isSeller: boolean
  businessName?: string
  verified?: boolean
  banned: boolean
}

/** All profiles with seller info joined (admin only). */
export async function getAllProfiles(): Promise<AdminUser[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at, seller_profiles(business_name, verified)")
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getAllProfiles error:", error.message)
    return []
  }

  // Ban status lives on auth.users (GoTrue), not the profiles table — see
  // adminSetUserBanned in lib/actions/admin.ts, which sets it via ban_duration.
  const bannedIds = new Set<string>()
  try {
    const admin = await createSupabaseServerAdminClient()
    const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 1000 })
    for (const u of authUsers?.users ?? []) {
      const bannedUntil = (u as unknown as { banned_until?: string | null }).banned_until
      if (bannedUntil && new Date(bannedUntil) > new Date()) bannedIds.add(u.id)
    }
  } catch (err) {
    console.error("getAllProfiles: failed to load ban status", err)
  }

  return (data as unknown as {
    id: string
    full_name: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
    seller_profiles: { business_name: string; verified: boolean }[] | { business_name: string; verified: boolean } | null
  }[]).map((p) => {
    const seller = Array.isArray(p.seller_profiles) ? p.seller_profiles[0] : p.seller_profiles
    return {
      id: p.id,
      fullName: p.full_name ?? "Unnamed user",
      avatarUrl: p.avatar_url ?? undefined,
      role: p.role,
      createdAt: p.created_at,
      isSeller: Boolean(seller),
      businessName: seller?.business_name,
      verified: seller?.verified,
      banned: bannedIds.has(p.id),
    }
  })
}
