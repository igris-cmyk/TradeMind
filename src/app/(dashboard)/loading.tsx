import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header Skeleton */}
      <div>
        <LoadingSkeleton variant="text" className="h-8 w-64 mb-2" />
        <LoadingSkeleton variant="text" className="h-4 w-96" />
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-3">
        <LoadingSkeleton variant="button" className="w-32" />
        <LoadingSkeleton variant="button" className="w-40" />
        <LoadingSkeleton variant="button" className="w-36" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" className="h-24" />
        ))}
      </div>

      {/* Chart Skeleton */}
      <LoadingSkeleton variant="card" className="h-[400px] w-full mt-8" />
    </div>
  );
}
