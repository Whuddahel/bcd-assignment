import { Skeleton } from "@/components/ui/skeleton"

export default function SellersLoading() {
  return (
    <div className="min-h-screen bg-midnight">
      <div className="border-b border-white/5 bg-midnight-50/50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Skeleton className="mx-auto h-10 w-72" />
          <Skeleton className="mx-auto mt-4 h-4 w-96" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card space-y-4 rounded-2xl p-6">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
