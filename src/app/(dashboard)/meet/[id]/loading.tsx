import { Skeleton } from "@/components/ui/skeleton";

export default function SessionDetailLoading() {
  return (
    <div
      className="space-y-6 max-w-3xl"
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-[0.625rem]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-28 rounded-[0.625rem]" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-0">
            <Skeleton className="h-5 w-28 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1 py-3 border-t border-[#E8ECF0]">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
