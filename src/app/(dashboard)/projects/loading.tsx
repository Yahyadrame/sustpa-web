/* ══════════════════════════════════════════════════════════════
   src/app/(dashboard)/projects/loading.tsx
══════════════════════════════════════════════════════════════ */
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40 rounded-[0.625rem]" />
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <Skeleton className="h-11.5 flex-1 max-w-sm rounded-xl" />
        <Skeleton className="h-11.5 w-52 rounded-[0.625rem]" />
      </div>

      {/* Table */}
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
