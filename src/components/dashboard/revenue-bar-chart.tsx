"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { RevenuePoint } from "@/lib/dashboard"

export function RevenueBarChart({
  data,
  barColor = "oklch(0.55 0.27 280)",
}: {
  data: RevenuePoint[]
  barColor?: string
}) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.018 280)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "oklch(0.55 0.025 280)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.11 0.022 280)",
              border: "1px solid oklch(0.22 0.018 280)",
              borderRadius: "12px",
              color: "oklch(0.95 0.010 280)",
              fontSize: 12,
            }}
            formatter={(value) => (typeof value === "number" ? [`$${value.toLocaleString()}`, "Revenue"] : ["", ""])}
            cursor={{ fill: "oklch(1 0 0 / 0.03)" }}
          />
          <Bar dataKey="revenue" fill={barColor} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
