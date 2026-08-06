"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient, createSupabaseServerAdminClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"
import type { ProductStatus } from "@/types/database"

export type ActionResult =
  | { ok: true; message?: string; slug?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const productSchema = z.object({
  title: z.string().min(3, "Title is too short").max(160),
  description: z.string().max(4000).optional().default(""),
  categoryId: z.string().min(1, "Pick a category"),
  condition: z.enum(["mint", "excellent", "very_good", "good", "fair"]),
  price: z.number().positive("Price must be greater than 0"),
  originalPrice: z.number().positive().optional(),
  status: z.enum(["draft", "pending_review", "active"]).default("pending_review"),
  attributes: z.record(z.string(), z.string()).optional().default({}),
  imageUrl: z.string().url().optional(),
})

export type ProductInput = z.input<typeof productSchema>

function flatten(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    fieldErrors[key] ??= issue.message
  }
  return fieldErrors
}

/** Resolve the seller_profile id owned by the current user. */
async function currentSellerId(): Promise<string | null> {
  const user = await getSessionUser()
  if (!user || user.isMock) return null
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()
  return data?.id ?? null
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Check the form", fieldErrors: flatten(parsed.error) }
  }

  const sellerId = await currentSellerId()
  if (!sellerId) return { ok: false, error: "You need an approved seller profile to list items." }

  const supabase = await createSupabaseServerClient()
  const d = parsed.data

  // Unique slug: base + short random suffix to avoid collisions.
  const slug = `${slugify(d.title)}-${Math.random().toString(36).slice(2, 7)}`

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      category_id: d.categoryId,
      title: d.title,
      slug,
      description: d.description,
      condition: d.condition,
      status: d.status,
      price: Math.round(d.price * 100),
      original_price: d.originalPrice ? Math.round(d.originalPrice * 100) : null,
      attributes: d.attributes,
    })
    .select("id, slug")
    .single()

  if (error || !product) return { ok: false, error: error?.message ?? "Could not create listing." }

  if (d.imageUrl) {
    await supabase.from("product_images").insert({
      product_id: product.id,
      url: d.imageUrl,
      is_primary: true,
      sort_order: 0,
    })
  }

  revalidatePath("/seller/products")
  revalidatePath("/browse")
  return { ok: true, message: "Listing created.", slug: product.slug }
}

export async function updateProductStatus(
  id: string,
  status: ProductStatus,
): Promise<ActionResult> {
  const sellerId = await currentSellerId()
  if (!sellerId) return { ok: false, error: "Not authorized." }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id)
    .eq("seller_id", sellerId)

  if (error) return { ok: false, error: error.message }
  revalidatePath("/seller/products")
  revalidatePath("/browse")
  return { ok: true, message: "Listing updated." }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const sellerId = await currentSellerId()
  if (!sellerId) return { ok: false, error: "Not authorized." }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("seller_id", sellerId)

  if (error) return { ok: false, error: error.message }
  revalidatePath("/seller/products")
  revalidatePath("/browse")
  return { ok: true, message: "Listing deleted." }
}

// Must be "delivered" specifically — that's the exact moment the on-chain
// transfer to this buyer actually happens (see status/route.tsx). Allowing an
// earlier status here would let someone relist an item before the token was
// ever transferred to them, silently skipping their own ownership hop from
// the on-chain provenance chain.
const RESALE_OWNED_STATUSES = ["delivered"]

const resaleSchema = z.object({
  sourceOrderItemId: z.string().min(1, "Pick an item from your collection"),
  price: z.number().positive("Price must be greater than 0"),
})

export type ResaleInput = z.input<typeof resaleSchema>

/**
 * Create a listing sourced from an item the seller already owns (a delivered
 * order_item), instead of describing a brand-new item. Title/description/
 * condition/category/images/attributes are copied verbatim from the original
 * listing — it's physically the same item. If that original was minted, the
 * existing token id carries over so no second token is ever minted for it;
 * the next delivery's existing transfer-on-delivery logic moves that same
 * token to the new buyer.
 */
export async function createResaleListing(input: ResaleInput): Promise<ActionResult> {
  const parsed = resaleSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Check the form", fieldErrors: flatten(parsed.error) }
  }

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "You must be signed in." }

  const sellerId = await currentSellerId()
  if (!sellerId) return { ok: false, error: "You need an approved seller profile to list items." }

  const supabase = await createSupabaseServerClient()

  // Verify the caller genuinely owns this item as a buyer (RLS already scopes
  // `orders`/`order_items` reads to the caller's own rows).
  const { data: sourceItem } = await supabase
    .from("order_items")
    .select("id, product_id, orders(buyer_id, status)")
    .eq("id", parsed.data.sourceOrderItemId)
    .maybeSingle()

  const order = sourceItem?.orders as { buyer_id: string; status: string } | null
  if (!sourceItem || !order || order.buyer_id !== user.id || !RESALE_OWNED_STATUSES.includes(order.status)) {
    return { ok: false, error: "You don't own this item." }
  }

  // One resale listing per owned item at a time (also enforced by a unique index).
  const { data: alreadyListed } = await supabase
    .from("products")
    .select("id")
    .eq("resale_of_order_item_id", sourceItem.id)
    .maybeSingle()
  if (alreadyListed) return { ok: false, error: "This item is already listed for resale." }

  // Read the original listing's full detail. By now it's very likely
  // `status = "sold"` and owned by a *different* seller, so `products_select_active`
  // RLS won't expose it to this caller — ownership of the physical item was
  // already proven above via the buyer-side order/order_items tables, so the
  // admin client is used here purely to read what RLS would otherwise hide.
  const admin = await createSupabaseServerAdminClient()
  const { data: source } = await admin
    .from("products")
    .select(
      "title, description, condition, category_id, attributes, blockchain_token_id, blockchain_minted_at, product_images(url, alt, sort_order, is_primary)",
    )
    .eq("id", sourceItem.product_id)
    .maybeSingle()

  if (!source) return { ok: false, error: "Could not find the original listing for this item." }

  const slug = `${slugify(source.title)}-${Math.random().toString(36).slice(2, 7)}`

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      resale_of_order_item_id: sourceItem.id,
      category_id: source.category_id,
      title: source.title,
      slug,
      description: source.description,
      condition: source.condition,
      status: "pending_review",
      price: Math.round(parsed.data.price * 100),
      attributes: source.attributes ?? {},
      blockchain_token_id: source.blockchain_token_id,
      blockchain_minted_at: source.blockchain_minted_at,
    })
    .select("id, slug")
    .single()

  if (error || !product) return { ok: false, error: error?.message ?? "Could not create listing." }

  const images = source.product_images ?? []
  if (images.length > 0) {
    await supabase.from("product_images").insert(
      images.map((img) => ({
        product_id: product.id,
        url: img.url,
        alt: img.alt,
        sort_order: img.sort_order,
        is_primary: img.is_primary,
      })),
    )
  }

  revalidatePath("/seller/products")
  revalidatePath("/browse")
  return { ok: true, message: "Resale listing created.", slug: product.slug }
}
