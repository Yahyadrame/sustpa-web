// ══════════════════════════════════════════════════════
// src/app/(dashboard)/meet/loading.tsx
// ══════════════════════════════════════════════════════
import { Skeleton } from "@/components/ui/skeleton";

export default function MeetLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-48 rounded-[0.625rem]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Tabs + recherche */}
      <div className="flex gap-3 items-center">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="pt-3 border-t border-[#E8ECF0] flex gap-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-6 w-6 rounded-lg ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
