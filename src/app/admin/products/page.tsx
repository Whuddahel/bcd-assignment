import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getAllProductsAdmin } from "@/lib/data/admin"
import { AdminProductsClient } from "./admin-products-client"

export const metadata: Metadata = { title: "Product Moderation" }

export default async function AdminProductsPage() {
  await requireUser(["admin"])
  const products = await getAllProductsAdmin()
  return <AdminProductsClient products={products} />
}
