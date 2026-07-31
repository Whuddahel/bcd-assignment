import type { Metadata } from "next"
import { requireUser } from "@/lib/auth/session"
import { getSellers } from "@/lib/data/sellers"
import { AdminSellersClient } from "./sellers-client"

export const metadata: Metadata = { title: "Seller Verification" }

export default async function AdminSellersPage() {
  await requireUser(["admin"])
  const sellers = await getSellers()
  return <AdminSellersClient sellers={sellers} />
}
