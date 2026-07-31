// View-models: the shape the UI renders. Pure + client-safe (no server imports),
// so client components and the cart store can import these types freely.
//
// The database stores prices in *cents* and omits a few presentational fields
// (gradient, badge, rarity) that the original design used. The mappers below
// derive those deterministically from real data so the UI stays identical while
// being fully backed by Supabase.

import type {
  Product,
  ProductImage,
  ProductCondition,
  SellerProfile,
  Category,
  Review,
  Order,
  OrderItem,
  OrderStatus,
  SupportTicket,
  SupportMessage,
  Profile,
} from "@/types/database"

// ── Product view-model ────────────────────────────────────────────────────────

export type ProductVM = {
  id: string
  slug: string
  title: string
  sellerId: string
  sellerName: string
  sellerVerified: boolean
  categorySlug: string
  categoryName: string
  price: number // whole dollars (converted from cents)
  originalPrice?: number
  condition: ProductCondition
  status: "active" | "sold" | "draft"
  rarity?: string
  badge?: string
  gradient: string
  isFeatured: boolean
  isTrending: boolean
  viewCount: number
  wishlistCount: number
  description: string
  provenanceNotes?: string
  certificateUrl?: string
  attributes: Record<string, string>
  images: string[]
}

// Category-flavoured gradient palettes. Several per category; a stable hash of
// the product id picks one so the same product always looks the same.
const GRADIENTS: Record<string, string[]> = {
  watches: [
    "from-violet-600/40 via-violet-800/60 to-violet-950/80",
    "from-slate-600/40 via-slate-800/60 to-slate-950/80",
    "from-blue-600/40 via-blue-800/60 to-blue-950/80",
  ],
  "fine-art": [
    "from-pink-600/40 via-pink-800/60 to-pink-950/80",
    "from-rose-600/40 via-rose-800/60 to-rose-950/80",
    "from-amber-600/40 via-amber-800/60 to-amber-950/80",
  ],
  designer: [
    "from-emerald-600/40 via-emerald-800/60 to-emerald-950/80",
    "from-zinc-600/40 via-zinc-800/60 to-zinc-950/80",
    "from-red-600/40 via-red-800/60 to-red-950/80",
  ],
  "rare-items": [
    "from-yellow-600/40 via-yellow-800/60 to-yellow-950/80",
    "from-sky-600/40 via-sky-800/60 to-sky-950/80",
    "from-orange-600/40 via-orange-800/60 to-orange-950/80",
  ],
  jewellery: [
    "from-yellow-600/40 via-amber-800/60 to-amber-950/80",
    "from-blue-600/40 via-blue-800/60 to-blue-950/80",
    "from-fuchsia-600/40 via-fuchsia-800/60 to-fuchsia-950/80",
  ],
  collectibles: [
    "from-cyan-600/40 via-cyan-800/60 to-cyan-950/80",
    "from-stone-600/40 via-stone-800/60 to-stone-950/80",
    "from-indigo-600/40 via-indigo-800/60 to-indigo-950/80",
  ],
}
const FALLBACK_GRADIENT = "from-violet-600/40 via-violet-800/60 to-violet-950/80"

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pickGradient(categorySlug: string, id: string): string {
  const palette = GRADIENTS[categorySlug]
  if (!palette || palette.length === 0) return FALLBACK_GRADIENT
  return palette[hashId(id) % palette.length]
}

/** A price-tier rarity label, so the card's rarity chip reads intentionally. */
function deriveRarity(priceCents: number): string {
  const dollars = priceCents / 100
  if (dollars >= 150_000) return "Ultra Rare"
  if (dollars >= 60_000) return "Rare"
  if (dollars >= 15_000) return "Investment"
  if (dollars >= 5_000) return "Collectible"
  return "Accessible"
}

/** A subtle badge derived from the product's real flags. */
function deriveBadge(p: Pick<Product, "is_trending" | "is_featured" | "original_price">):
  | string
  | undefined {
  if (p.original_price) return "↓ Deal"
  if (p.is_trending) return "🔥 Hot"
  if (p.is_featured) return "✦ Featured"
  return undefined
}

/** Prettify an attribute key: "case_material" → "Case Material". */
function prettifyKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bMm\b/, "mm")
}

function normalizeAttributes(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === null || v === undefined) continue
    out[prettifyKey(k)] = String(v)
  }
  return out
}

function mapStatus(status: Product["status"]): ProductVM["status"] {
  if (status === "sold") return "sold"
  if (status === "active") return "active"
  return "draft"
}

// The DB row shape a product query is expected to return (with relations).
export type ProductRow = Product & {
  product_images?: Pick<ProductImage, "url" | "sort_order" | "is_primary">[] | null
  seller_profiles?: Pick<SellerProfile, "business_name" | "verified"> | null
  categories?: Pick<Category, "name" | "slug"> | null
}

export function mapProduct(row: ProductRow): ProductVM {
  const categorySlug = row.categories?.slug ?? "collectibles"
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .map((i) => i.url)

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    sellerId: row.seller_id,
    sellerName: row.seller_profiles?.business_name ?? "Aureon Seller",
    sellerVerified: row.seller_profiles?.verified ?? false,
    categorySlug,
    categoryName: row.categories?.name ?? "Collectibles",
    price: row.price / 100,
    originalPrice: row.original_price ? row.original_price / 100 : undefined,
    condition: row.condition,
    status: mapStatus(row.status),
    rarity: deriveRarity(row.price),
    badge: deriveBadge(row),
    gradient: pickGradient(categorySlug, row.id),
    isFeatured: row.is_featured,
    isTrending: row.is_trending,
    viewCount: row.view_count,
    wishlistCount: row.wishlist_count,
    description: row.description ?? "",
    provenanceNotes: row.provenance_notes ?? undefined,
    certificateUrl: row.certificate_url ?? undefined,
    attributes: normalizeAttributes(row.attributes),
    images,
  }
}

// ── Category view-model ───────────────────────────────────────────────────────

export type CategoryVM = {
  id: string
  name: string
  slug: string
  description: string
  count: number
}

// ── Seller view-model ─────────────────────────────────────────────────────────

export type SellerVM = {
  id: string
  userId: string
  businessName: string
  description: string
  logoUrl?: string
  bannerUrl?: string
  websiteUrl?: string
  instagramUrl?: string
  verified: boolean
  totalSales: number
  totalRevenue: number // dollars
  rating: number
  reviewCount: number
  specialty?: string
  onboardingComplete: boolean
  stripeAccountId?: string
}

export function mapSeller(
  row: SellerProfile & { specialty?: string | null },
): SellerVM {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    description: row.description ?? "",
    logoUrl: row.logo_url ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    instagramUrl: row.instagram_url ?? undefined,
    verified: row.verified,
    totalSales: row.total_sales,
    totalRevenue: row.total_revenue / 100,
    rating: row.rating ?? 0,
    reviewCount: row.review_count,
    specialty: row.specialty ?? undefined,
    onboardingComplete: row.stripe_onboarding_complete,
    stripeAccountId: row.stripe_account_id ?? undefined,
  }
}

// ── Review view-model ─────────────────────────────────────────────────────────

export type ReviewVM = {
  id: string
  productId: string
  rating: number
  reviewer: string
  reviewerAvatar?: string
  title: string
  body: string
  date: string
}

export function mapReview(
  row: Review & {
    profiles?: Pick<Profile, "full_name" | "avatar_url"> | null
  },
): ReviewVM {
  const name = row.profiles?.full_name ?? "Verified Buyer"
  // "Emma Wilson" → "Emma W." for a touch of privacy, matching the old UI.
  const parts = name.split(" ")
  const display = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : name

  return {
    id: row.id,
    productId: row.product_id,
    rating: row.rating,
    reviewer: display,
    reviewerAvatar: row.profiles?.avatar_url ?? undefined,
    title: row.title ?? "",
    body: row.body ?? "",
    date: row.created_at,
  }
}

// ── Order view-model ──────────────────────────────────────────────────────────

export type OrderItemVM = {
  id: string
  productId: string
  slug?: string
  title: string
  price: number // dollars
  quantity: number
  gradient: string
  image?: string
}

export type OrderVM = {
  id: string
  shortId: string
  status: OrderStatus
  date: string
  total: number // dollars
  platformFee: number // dollars
  paymentStatus?: string
  shippingAddress?: Record<string, string>
  items: OrderItemVM[]
  // Convenience: first item, for compact order cards.
  product: OrderItemVM | null
}

type OrderItemRow = OrderItem & {
  products?:
    | (Pick<Product, "slug" | "category_id"> & {
        product_images?: Pick<ProductImage, "url" | "is_primary">[] | null
        categories?: Pick<Category, "slug"> | null
      })
    | null
}

export function mapOrder(
  row: Order & { order_items?: OrderItemRow[] | null },
): OrderVM {
  const items: OrderItemVM[] = (row.order_items ?? []).map((it) => {
    const catSlug = it.products?.categories?.slug ?? "collectibles"
    const img = (it.products?.product_images ?? []).find((i) => i.is_primary)?.url
    return {
      id: it.id,
      productId: it.product_id,
      slug: it.products?.slug ?? undefined,
      title: it.title,
      price: it.price / 100,
      quantity: it.quantity,
      gradient: pickGradient(catSlug, it.product_id),
      image: img,
    }
  })

  return {
    id: row.id,
    shortId: row.id.slice(0, 8).toUpperCase(),
    status: row.status,
    date: row.created_at,
    total: row.total_amount / 100,
    platformFee: row.platform_fee / 100,
    paymentStatus: row.stripe_payment_status ?? undefined,
    shippingAddress: (row.shipping_address as Record<string, string> | null) ?? undefined,
    items,
    product: items[0] ?? null,
  }
}

// ── Support ticket view-model ─────────────────────────────────────────────────

export type TicketMessageVM = {
  id: string
  sender: string
  senderId: string
  body: string
  isInternal: boolean
  date: string
}

export type TicketVM = {
  id: string
  shortId: string
  subject: string
  status: SupportTicket["status"]
  priority: SupportTicket["priority"]
  user: string
  userId: string
  orderId: string | null
  assignedTo: string | null
  date: string
  updatedAt: string
  messages: TicketMessageVM[]
}

export function mapTicket(
  row: SupportTicket & {
    profiles?: Pick<Profile, "full_name"> | null
    support_messages?: (SupportMessage & {
      profiles?: Pick<Profile, "full_name"> | null
    })[] | null
  },
): TicketVM {
  return {
    id: row.id,
    shortId: row.id.slice(0, 8).toUpperCase(),
    subject: row.subject,
    status: row.status,
    priority: row.priority,
    user: row.profiles?.full_name ?? "Customer",
    userId: row.user_id,
    orderId: row.order_id,
    assignedTo: row.assigned_to,
    date: row.created_at,
    updatedAt: row.updated_at,
    messages: (row.support_messages ?? [])
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m) => ({
        id: m.id,
        sender: m.profiles?.full_name ?? "Aureon",
        senderId: m.sender_id,
        body: m.body,
        isInternal: m.is_internal,
        date: m.created_at,
      })),
  }
}
