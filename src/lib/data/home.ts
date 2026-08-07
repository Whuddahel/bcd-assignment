import "server-only"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"

/**
 * Everything the marketing homepage renders, read from Supabase.
 *
 * The landing page used to hard-code its numbers, tickers, collections and
 * testimonials. Each block below returns real rows and an empty result is a
 * meaningful answer — the corresponding section simply doesn't render rather
 * than falling back to invented figures.
 */

export type HomeStat = { label: string; value: string }

export type TickerItem = {
  id: string
  title: string
  slug: string
  price: number // dollars
  /** Percentage below the original asking price, when the seller set one. */
  delta?: string
}

export type HeroCard = {
  id: string
  title: string
  slug: string
  price: number
  tier: string
  image?: string
  verified: boolean
}

export type LatestSale = { title: string; price: number }

export type CollectionPreview = {
  slug: string
  name: string
  description: string
  itemCount: number
  items: { id: string; title: string; price: number }[]
}

export type CategoryTile = {
  slug: string
  name: string
  description: string
  count: number
}

export type HomeTestimonial = {
  id: string
  name: string
  initials: string
  avatarUrl?: string
  rating: number
  quote: string
  productTitle?: string
}

export type HomeData = {
  stats: HomeStat[]
  ticker: TickerItem[]
  heroCards: HeroCard[]
  latestSale: LatestSale | null
  collections: CollectionPreview[]
  categories: CategoryTile[]
  brands: string[]
  testimonials: HomeTestimonial[]
  subscriberCount: number
}

/** A price-tier label, matching the one product cards use. */
function tierFor(priceCents: number): string {
  const dollars = priceCents / 100
  if (dollars >= 150_000) return "Ultra Rare"
  if (dollars >= 60_000) return "Rare"
  if (dollars >= 15_000) return "Investment"
  if (dollars >= 5_000) return "Collectible"
  return "Accessible"
}

function compactCurrency(dollars: number): string {
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(dollars >= 10_000_000 ? 0 : 1)}M`
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(dollars >= 10_000 ? 0 : 1)}K`
  return `$${Math.round(dollars).toLocaleString()}`
}

type ProductRow = {
  id: string
  title: string
  slug: string
  price: number
  original_price: number | null
  view_count: number
  is_featured: boolean
  category_id: string
  attributes: unknown
  seller_profiles: { verified: boolean } | null
  product_images: { url: string; is_primary: boolean; sort_order: number }[] | null
}

export async function getHomeData(): Promise<HomeData> {
  const supabase = await createSupabaseServerClient()

  const [{ data: products }, { data: categories }, { count: verifiedSellers }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, title, slug, price, original_price, view_count, is_featured, category_id, attributes, seller_profiles(verified), product_images(url, is_primary, sort_order)",
      )
      .eq("status", "active")
      .order("view_count", { ascending: false })
      .limit(60),
    supabase.from("categories").select("id, name, slug, description").order("sort_order"),
    supabase
      .from("seller_profiles")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
  ])

  const rows = (products ?? []) as unknown as ProductRow[]
  const cats = categories ?? []

  const [traded, latestSale, testimonials, subscriberCount] = await Promise.all([
    getTotalTraded(),
    getLatestSale(),
    getTestimonials(),
    getSubscriberCount(),
  ])

  return {
    stats: [
      { label: "Live listings", value: rows.length >= 60 ? "60+" : String(rows.length) },
      { label: "Verified sellers", value: String(verifiedSellers ?? 0) },
      { label: "Total traded", value: compactCurrency(traded) },
    ],
    ticker: buildTicker(rows),
    heroCards: buildHeroCards(rows),
    latestSale,
    collections: buildCollections(rows, cats),
    categories: cats.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description ?? "",
      count: rows.filter((p) => p.category_id === c.id).length,
    })),
    brands: buildBrands(rows),
    testimonials,
    subscriberCount,
  }
}

function buildTicker(rows: ProductRow[]): TickerItem[] {
  return rows.slice(0, 8).map((p) => {
    // The only genuine price movement in the data: a seller listing below their
    // own original ask. Anything else would be a made-up number.
    const delta =
      p.original_price && p.original_price > p.price
        ? `-${(((p.original_price - p.price) / p.original_price) * 100).toFixed(1)}%`
        : undefined

    return { id: p.id, title: p.title, slug: p.slug, price: p.price / 100, delta }
  })
}

function buildHeroCards(rows: ProductRow[]): HeroCard[] {
  return [...rows]
    .sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured) || b.view_count - a.view_count,
    )
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price / 100,
      tier: tierFor(p.price),
      image: (p.product_images ?? [])
        .slice()
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]?.url,
      verified: p.seller_profiles?.verified ?? false,
    }))
}

function buildCollections(
  rows: ProductRow[],
  categories: { id: string; name: string; slug: string; description: string | null }[],
): CollectionPreview[] {
  return categories
    .map((c) => {
      const inCategory = rows
        .filter((p) => p.category_id === c.id)
        .sort((a, b) => b.price - a.price)

      return {
        slug: c.slug,
        name: c.name,
        description: c.description ?? "",
        itemCount: inCategory.length,
        items: inCategory.slice(0, 3).map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price / 100,
        })),
      }
    })
    .filter((c) => c.itemCount > 0)
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 3)
}

/** Brand names as sellers actually typed them into their listing attributes. */
function buildBrands(rows: ProductRow[]): string[] {
  const seen = new Map<string, string>()

  for (const p of rows) {
    if (!p.attributes || typeof p.attributes !== "object") continue
    for (const [key, value] of Object.entries(p.attributes as Record<string, unknown>)) {
      if (!/^(brand|maker|designer|artist|manufacturer)$/i.test(key.replace(/_/g, " ").trim())) continue
      const name = String(value).trim()
      if (name.length < 2 || name.length > 40) continue
      // Case-insensitive de-dupe, first spelling wins.
      if (!seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name)
    }
  }

  return [...seen.values()].slice(0, 20)
}

/** Gross merchandise value: every order that wasn't cancelled or refunded. */
async function getTotalTraded(): Promise<number> {
  try {
    const admin = await createSupabaseServerAdminClient()
    const { data } = await admin
      .from("orders")
      .select("total_amount")
      .not("status", "in", "(cancelled,refunded,pending)")

    return (data ?? []).reduce((sum, o) => sum + o.total_amount, 0) / 100
  } catch {
    return 0
  }
}

/** The most recent completed purchase, for the hero's "just sold" chip. */
async function getLatestSale(): Promise<LatestSale | null> {
  try {
    const admin = await createSupabaseServerAdminClient()
    const { data } = await admin
      .from("order_items")
      .select("title, price, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!data) return null
    return { title: data.title, price: data.price / 100 }
  } catch {
    return null
  }
}

async function getTestimonials(): Promise<HomeTestimonial[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, title, body, profiles(full_name, avatar_url), products(title)")
    .gte("rating", 4)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(3)

  type ReviewRow = {
    id: string
    rating: number
    body: string | null
    profiles: { full_name: string | null; avatar_url: string | null } | null
    products: { title: string } | null
  }

  return ((data ?? []) as unknown as ReviewRow[])
    .filter((r) => (r.body ?? "").trim().length > 0)
    .map((r) => {
      const full = r.profiles?.full_name?.trim() || "Verified buyer"
      const parts = full.split(/\s+/)
      // "Emma Wilson" → "Emma W." — same privacy trim the product reviews use.
      const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : full

      return {
        id: r.id,
        name,
        initials: parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
        avatarUrl: r.profiles?.avatar_url ?? undefined,
        rating: r.rating,
        quote: (r.body ?? "").trim(),
        productTitle: r.products?.title,
      }
    })
}

async function getSubscriberCount(): Promise<number> {
  try {
    const admin = await createSupabaseServerAdminClient()
    const { count } = await admin
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
    return count ?? 0
  } catch {
    return 0
  }
}
