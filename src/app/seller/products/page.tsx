import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientText } from "@/components/brand/gradient-text"
import { requireUser } from "@/lib/auth/session"
import { getSellerByUserId } from "@/lib/data/sellers"
import { getSellerProducts } from "@/lib/data/products"
import { ProductsClient } from "./products-client"

export const metadata: Metadata = { title: "My Listings" }

export default async function SellerProductsPage() {
  const user = await requireUser(["seller", "admin"])
  const seller = await getSellerByUserId(user.id)

  if (!seller) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
          <h1 className="mt-1 font-display text-3xl font-bold">My <GradientText>Listings</GradientText></h1>
        </div>
        <div className="glass-card rounded-2xl py-16 text-center">
          <p className="text-sm text-muted-foreground">No seller profile is linked to this account yet.</p>
          <Button className="gradient-brand mt-4 border-0 text-white hover:opacity-90" asChild>
            <Link href="/seller/apply"><Plus className="mr-2 h-4 w-4" /> Apply to sell</Link>
          </Button>
        </div>
      </div>
    )
  }

  const products = await getSellerProducts(seller.id)
  return <ProductsClient initialProducts={products} />
}
