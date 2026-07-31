"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSessionUser } from "@/lib/auth/session"

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(160).optional(),
  body: z.string().max(2000).optional(),
})

export type ReviewInput = z.input<typeof reviewSchema>

/** Create (or update) the current user's review of a product. */
export async function submitReview(input: ReviewInput): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Please provide a rating between 1 and 5." }

  const user = await getSessionUser()
  if (!user || user.isMock) return { ok: false, error: "Please sign in to leave a review." }

  const supabase = await createSupabaseServerClient()
  const d = parsed.data

  // upsert on (product_id, reviewer_id) so a user can revise their review.
  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: d.productId,
      reviewer_id: user.id,
      rating: d.rating,
      title: d.title ?? null,
      body: d.body ?? null,
    },
    { onConflict: "product_id,reviewer_id" },
  )

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/product`)
  return { ok: true, message: "Thanks for your review." }
}
