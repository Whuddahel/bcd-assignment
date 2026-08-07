import { getSessionUser } from "@/lib/auth/session"
import { getSellerByUserId } from "@/lib/data/sellers"
import { SellerShell } from "./seller-shell"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  const seller = user && !user.isMock ? await getSellerByUserId(user.id) : null
  // Kept in sync with the middleware guard for /seller (seller, admin, support
  // all pass it) — a support agent who applies as a seller must see the full
  // hub, not just the profile-application tab.
  const isSeller = Boolean(
    user && (user.role === "seller" || user.role === "admin" || user.role === "support"),
  )

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
