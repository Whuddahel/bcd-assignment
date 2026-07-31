import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapProduct, type ProductVM, type ProductRow } from "./types"
import type { UserRole } from "@/types/database"

const PRODUCT_SELECT =
  "*, product_images(url,sort_order,is_primary), seller_profiles(business_name,verified), categories(name,slug)"

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
  role: UserRole
  createdAt: string
  isSeller: boolean
  businessName?: string
  verified?: boolean
}

/** All profiles with seller info joined (admin only). */
export async function getAllProfiles(): Promise<AdminUser[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at, seller_profiles(business_name, verified)")
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getAllProfiles error:", error.message)
    return []
  }

  return (data as unknown as {
    id: string
    full_name: string | null
    role: UserRole
    created_at: string
    seller_profiles: { business_name: string; verified: boolean }[] | { business_name: string; verified: boolean } | null
  }[]).map((p) => {
    const seller = Array.isArray(p.seller_profiles) ? p.seller_profiles[0] : p.seller_profiles
    return {
      id: p.id,
      fullName: p.full_name ?? "Unnamed user",
      role: p.role,
      createdAt: p.created_at,
      isSeller: Boolean(seller),
      businessName: seller?.business_name,
      verified: seller?.verified,
    }
  })
}
