export type RevenuePoint = { month: string; revenue: number }

/** Buckets dated revenue into the last 6 calendar months. Server-safe (pure). */
export function toLast6Months(rows: { created_at: string; amount: number }[]): RevenuePoint[] {
  const now = new Date()
  const points: RevenuePoint[] = []
  const buckets = new Map<string, number>()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets.set(key, 0)
    points.push({ month: d.toLocaleString("en-US", { month: "short" }), revenue: 0 })
  }

  for (const row of rows) {
    const d = new Date(row.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + row.amount)
  }

  const keys = [...buckets.keys()]
  return points.map((p, i) => ({ month: p.month, revenue: buckets.get(keys[i]) ?? 0 }))
}
