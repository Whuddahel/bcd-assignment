import { Skeleton, DashboardStatsSkeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-9 w-64" />
      <div className="mb-8"><DashboardStatsSkeleton /></div>
      <Skeleton className="mb-8 h-64 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  )
}
