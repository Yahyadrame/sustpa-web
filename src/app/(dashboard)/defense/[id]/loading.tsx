import { Skeleton } from "@/components/ui/skeleton";

export default function DefenseDetailLoading() {
  return (
    <div
      className="space-y-6 max-w-3xl"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-[0.625rem]" />
          <Skeleton className="h-9 w-36 rounded-[0.625rem]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-4"
            >
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1 py-2 border-t border-[#E8ECF0]">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
