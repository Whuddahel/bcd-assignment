import { Skeleton, DashboardStatsSkeleton } from "@/components/ui/skeleton"

export default function AccountLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-9 w-64" />
      <div className="mb-8"><DashboardStatsSkeleton /></div>
      <div className="glass-card space-y-4 rounded-2xl p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
