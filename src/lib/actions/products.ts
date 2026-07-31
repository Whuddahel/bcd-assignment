"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"
import { slugify } from "@/lib/utils"
import type { ProductStatus } from "@/types/database"

export type ActionResult =
  | { ok: true; message?: string; slug?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const productSchema = z.object({
  title: z.string().min(3, "Title is too short").max(160),
  description: z.string().max(4000).optional().default(""),
  categoryId: z.string().uuid("Pick a category"),
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
