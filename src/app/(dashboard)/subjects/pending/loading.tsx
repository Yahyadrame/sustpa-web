import { Skeleton } from "@/components/ui/skeleton";

export default function PendingSubjectsLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-36 rounded-[0.625rem]" />
      </div>

      {/* Recherche */}
      <Skeleton className="h-11.5 max-w-sm w-full rounded-xl" />

      {/* Liste */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Skeleton className="h-8 w-20 rounded-[0.625rem]" />
                <Skeleton className="h-8 w-20 rounded-[0.625rem]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
