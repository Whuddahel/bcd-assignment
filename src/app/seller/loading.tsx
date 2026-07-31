import { Skeleton, DashboardStatsSkeleton } from "@/components/ui/skeleton"

export default function SellerLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-9 w-56" />
      <div className="mb-8"><DashboardStatsSkeleton /></div>
      <Skeleton className="mb-8 h-64 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  )
}
