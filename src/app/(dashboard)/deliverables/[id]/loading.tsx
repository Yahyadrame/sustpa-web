import { Skeleton } from "@/components/ui/skeleton";

export default function DeliverableDetailLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-[0.625rem]" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-[0.625rem]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Carte fichier */}
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-125 w-full rounded-xl" />
          </div>

          {/* Onglets */}
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-4">
            <div className="flex gap-4 border-b border-[#E8ECF0] pb-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl" style={{ background: "#F6F8FA" }}>
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1 py-2 border-t border-[#E8ECF0]">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}