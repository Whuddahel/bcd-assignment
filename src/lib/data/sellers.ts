import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { mapSeller, type SellerVM } from "./types"

/** Compute each seller's specialty = the category they list the most in. */
async function attachSpecialties(sellerIds: string[]): Promise<Map<string, string>> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("products")
    .select("seller_id, categories(name)")
    .in("seller_id", sellerIds)
    .eq("status", "active")

  const tally = new Map<string, Map<string, number>>()
  for (const row of (data ?? []) as { seller_id: string; categories: { name: string } | null }[]) {
    const name = row.categories?.name
    if (!name) continue
    if (!tally.has(row.seller_id)) tally.set(row.seller_id, new Map())
    const inner = tally.get(row.seller_id)!
    inner.set(name, (inner.get(name) ?? 0) + 1)
  }

  const out = new Map<string, string>()
  for (const [sellerId, inner] of tally) {
    const top = [...inner.entries()].sort((a, b) => b[1] - a[1])[0]
    if (top) out.set(sellerId, top[0])
  }
  return out
}

export async function getSellers(): Promise<SellerVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .order("total_sales", { ascending: false })

  if (error || !data) {
    if (error) console.error("getSellers error:", error.message)
    return []
  }

  const specialties = await attachSpecialties(data.map((s) => s.id))
  return data.map((s) => mapSeller({ ...s, specialty: specialties.get(s.id) ?? null }))
}

export async function getSellerById(id: string): Promise<SellerVM | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  const specialties = await attachSpecialties([data.id])
  return mapSeller({ ...data, specialty: specialties.get(data.id) ?? null })
}

/** The seller_profile owned by a given auth user, if any. */
export async function getSellerByUserId(userId: string): Promise<SellerVM | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return null
  const specialties = await attachSpecialties([data.id])
  return mapSeller({ ...data, specialty: specialties.get(data.id) ?? null })
}
