// ══════════════════════════════════════════════════════
// src/app/(dashboard)/deliverables/loading.tsx
// ══════════════════════════════════════════════════════
import { Skeleton } from "@/components/ui/skeleton";

export default function DeliverablesLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-44 rounded-[0.625rem]" />
      </div>

      {/* Stat chips */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <Skeleton className="h-11.5 flex-1 max-w-sm rounded-xl" />
        <Skeleton className="h-11.5 w-28 rounded-[0.625rem]" />
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full shrink-0" />
            </div>
            <div className="pt-3 border-t border-[#E8ECF0] flex gap-2">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
