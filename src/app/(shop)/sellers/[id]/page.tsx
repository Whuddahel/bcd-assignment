import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSellerById } from "@/lib/data/sellers"
import { getProducts } from "@/lib/data/products"
import { SellerProfile } from "./seller-profile"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const seller = await getSellerById(id)
  return { title: seller ? seller.businessName : "Seller not found" }
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const seller = await getSellerById(id)
  if (!seller) notFound()

  const listings = await getProducts({ sellerId: seller.id, limit: 100 })

  return <SellerProfile seller={seller} listings={listings} />
}
