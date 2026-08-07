import { getSessionUser } from "@/lib/auth/session"
import { getSellerByUserId } from "@/lib/data/sellers"
import { SellerShell } from "./seller-shell"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  const seller = user && !user.isMock ? await getSellerByUserId(user.id) : null
  const isSeller = Boolean(user && (user.role === "seller" || user.role === "admin"))

  return (
    <SellerShell
      isSeller={isSeller}
      businessName={seller?.businessName ?? null}
      logoUrl={seller?.logoUrl ?? null}
    >
      {children}
    </SellerShell>
  )
}
