import { TrendingUp } from "lucide-react"
import { GradientText } from "@/components/brand/gradient-text"
import { requireUser } from "@/lib/auth/session"
import { getSellerByUserId } from "@/lib/data/sellers"
import { getSellerStats } from "@/lib/data/dashboard"
import { getSellerProducts } from "@/lib/data/products"
import { AnalyticsClient } from "./analytics-client"

// Palette for the "Sales by Category" donut, matching the original design.
const CATEGORY_COLORS = [
  "oklch(0.55 0.27 280)",
  "oklch(0.62 0.26 340)",
  "oklch(0.75 0.165 70)",
  "oklch(0.55 0.025 280)",
]

export default async function SellerAnalyticsPage() {
  const user = await requireUser(["seller", "admin"])
  const seller = await getSellerByUserId(user.id)

  if (!seller) {
    return (
      <div>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Seller Hub</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            <GradientText>Analytics</GradientText>
          </h1>
        </div>
        <div className="glass-card rounded-2xl py-20 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-violet-400" />
          <p className="mt-4 font-semibold text-foreground">No seller profile yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Set up your seller profile to start tracking analytics.</p>
        </div>
      </div>
    )
  }

  const [stats, products] = await Promise.all([
    getSellerStats(seller.id),
    getSellerProducts(seller.id),
  ])

  // Derive "Sales by Category" share from the seller's own listings.
  const counts = new Map<string, number>()
  for (const p of products) {
    counts.set(p.categoryName, (counts.get(p.categoryName) ?? 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = ranked.slice(0, 3)
  const otherTotal = ranked.slice(3).reduce((sum, [, n]) => sum + n, 0)
  const withOther = otherTotal > 0 ? [...top, ["Other", otherTotal] as [string, number]] : top
  const total = withOther.reduce((sum, [, n]) => sum + n, 0) || 1
  const categoryData = withOther.map(([name, n], i) => ({
    name,
    value: Math.round((n / total) * 100),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  const topProducts = [...products]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4)

  return <AnalyticsClient stats={stats} categoryData={categoryData} topProducts={topProducts} />
}
