import "server-only"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CategoryVM } from "./types"

export async function getCategories(): Promise<CategoryVM[]> {
  const supabase = await createSupabaseServerClient()

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("sort_order", { ascending: true })

  if (error || !categories) {
    if (error) console.error("getCategories error:", error.message)
    return []
  }

  // Active-product count per category (few categories → a handful of head counts).
  const counts = await Promise.all(
    categories.map(async (c) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", c.id)
        .eq("status", "active")
      return [c.id, count ?? 0] as const
    }),
  )
  const countMap = new Map(counts)

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    count: countMap.get(c.id) ?? 0,
  }))
}
