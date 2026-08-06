import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getCategories } from "@/lib/data/categories"
import { getResaleCandidates } from "@/lib/data/orders"
import { NewListingForm } from "./new-listing-form"

export const metadata: Metadata = { title: "New Listing" }

export default async function NewListingPage() {
  const user = await requireUser(["seller", "admin"])
  const [categories, resaleCandidates] = await Promise.all([
    getCategories(),
    getResaleCandidates(user.id),
  ])
  return <NewListingForm categories={categories} userId={user.id} resaleCandidates={resaleCandidates} />
}

