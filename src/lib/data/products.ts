import "server-only"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { mapProduct, type ProductVM, type ProductRow } from "./types"

const PRODUCT_SELECT =
  "*, product_images(url,sort_order,is_primary), seller_profiles(business_name,verified), categories(name,slug)"

export type ProductSort = "newest" | "price_asc" | "price_desc" | "trending" | "featured"

export type ProductQuery = {
  categorySlug?: string
  search?: string
  sort?: ProductSort
  sellerId?: string
  minPrice?: number // dollars
  maxPrice?: number // dollars
  featured?: boolean
  trending?: boolean
  limit?: number
}

/** Escape PostgREST `or()` filter metacharacters from user input. */
function sanitize(q: string): string {
  return q.replace(/[,()*]/g, " ").trim()
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductVM[]> {
  const supabase = await createSupabaseServerClient()

  // !inner so filtering on the embedded category slug filters parent rows.
  const select = query.categorySlug
    ? "*, product_images(url,sort_order,is_primary), seller_profiles(business_name,verified), categories!inner(name,slug)"
    : PRODUCT_SELECT

  let q = supabase.from("products").select(select).eq("status", "active")

  if (query.categorySlug) q = q.eq("categories.slug", query.categorySlug)
  if (query.sellerId) q = q.eq("seller_id", query.sellerId)
  if (query.featured) q = q.eq("is_featured", true)
  if (query.trending) q = q.eq("is_trending", true)
  if (query.minPrice != null) q = q.gte("price", Math.round(query.minPrice * 100))
  if (query.maxPrice != null) q = q.lte("price", Math.round(query.maxPrice * 100))

  if (query.search) {
    const s = sanitize(query.search)
    if (s) q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`)
  }

  switch (query.sort) {
    case "price_asc":
      q = q.order("price", { ascending: true })
      break
    case "price_desc":
      q = q.order("price", { ascending: false })
      break
    case "trending":
      q = q.order("view_count", { ascending: false })
      break
    case "featured":
      q = q.order("is_featured", { ascending: false }).order("view_count", { ascending: false })
      break
    default:
      q = q.order("created_at", { ascending: false })
  }

  if (query.limit) q = q.limit(query.limit)

  const { data, error } = await q
  if (error) {
    console.error("getProducts error:", error.message)
    return []
  }
  return (data as unknown as ProductRow[]).map(mapProduct)
}

export async function getFeaturedProducts(limit = 8): Promise<ProductVM[]> {
  return getProducts({ featured: true, sort: "featured", limit })
}

export async function getTrendingProducts(limit = 8): Promise<ProductVM[]> {
  return getProducts({ trending: true, sort: "trending", limit })
}

export async function getProductBySlug(slug: string): Promise<ProductVM | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error("getProductBySlug error:", error.message)
    return null
  }
  return mapProduct(data as unknown as ProductRow)
}

/** Other active products in the same category, excluding the given one. */
export async function getRelatedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4,
): Promise<ProductVM[]> {
  const products = await getProducts({ categorySlug, limit: limit + 1 })
  return products.filter((p) => p.id !== excludeId).slice(0, limit)
}

/** A seller's own products across ALL statuses (for the seller product manager). */
export async function getSellerProducts(sellerId: string): Promise<ProductVM[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    if (error) console.error("getSellerProducts error:", error.message)
    return []
  }
  return (data as unknown as ProductRow[]).map(mapProduct)
}

export type CheckoutProduct = {
  id: string
  title: string
  price: number // dollars
  sellerId: string
  status: string
}

/**
 * Minimal, trusted product data for checkout/fulfilment — looked up fresh from
 * Supabase by id rather than carried through Stripe metadata (which caps each
 * value at 500 characters and shouldn't be trusted over the DB anyway). Uses
 * the admin client since this runs from the checkout route and the Stripe
 * webhook, neither of which has a buyer's session to read as.
 */
export async function getProductsForCheckout(ids: string[]): Promise<CheckoutProduct[]> {
  if (ids.length === 0) return []
  const supabase = await createSupabaseServerAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, seller_id, status")
    .in("id", ids)

  if (error || !data) return []
  return data.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price / 100,
    sellerId: p.seller_id,
    status: p.status,
  }))
}

/** Best-effort view-count bump. Never throws; failure is non-fatal for a page. */
export async function incrementProductView(id: string): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    // Typed loosely: the RPC is an optional SECURITY DEFINER helper (see migration
    // 20240101000002). Absent in older DBs, which the catch tolerates.
    await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<unknown>)(
      "increment_product_view",
      { p_id: id },
    )
  } catch {
    // RPC is optional; ignore if it doesn't exist yet.
  }
}
