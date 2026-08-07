import { getSupportStats } from "@/lib/data/dashboard"
import { SupportShell } from "./support-shell"

export default async function SupportLayout({ children }: { children: React.ReactNode }) {
  const stats = await getSupportStats()

  return <SupportShell openTickets={stats.open}>{children}</SupportShell>
}
