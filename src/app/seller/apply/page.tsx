import type { Metadata } from "next"
import { getSessionUser } from "@/lib/auth/session"
import { getSellerByUserId } from "@/lib/data/sellers"
import { SellerApplyClient } from "./apply-client"

export const metadata: Metadata = { title: "Become a Seller" }

export default async function SellerApplyPage() {
  const user = await getSessionUser()
  const existing = user && !user.isMock ? await getSellerByUserId(user.id) : null

  return <SellerApplyClient existing={existing} />
}
