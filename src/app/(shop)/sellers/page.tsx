import type { Metadata } from "next"
import { getSellers } from "@/lib/data/sellers"
import { SellersClient } from "./sellers-client"

export const metadata: Metadata = {
  title: "Sellers",
  description: "Meet Aureon's verified specialist sellers across watches, art, and rare collectibles.",
}

export default async function SellersPage() {
  const sellers = await getSellers()
  return <SellersClient sellers={sellers} />
}
