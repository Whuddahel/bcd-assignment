import { Skeleton, ProductGridSkeleton } from "@/components/ui/skeleton"

export default function BrowseLoading() {
  return (
    <div className="min-h-screen bg-midnight">
      <div className="border-b border-white/5 bg-midnight-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-10 w-72" />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-4 w-24" />
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  )
}
