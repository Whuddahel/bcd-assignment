import { getAdminStats } from "@/lib/data/dashboard"
import { AdminShell } from "./admin-shell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getAdminStats()

  return (
    <AdminShell pendingProducts={stats.pendingProducts} pendingSellers={stats.pendingApprovals}>
      {children}
    </AdminShell>
  )
}
