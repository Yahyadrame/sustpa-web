import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-72" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-[0.625rem]" />
          <Skeleton className="h-9 w-32 rounded-[0.625rem]" />
        </div>
      </div>

      {/* Corps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card description */}
          <div
            className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3"
            style={{
              boxShadow:
                "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
            }}
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Card jalons */}
          <div
            className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-4"
            style={{
              boxShadow:
                "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#F6F8FA]"
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div
            className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3"
            style={{
              boxShadow:
                "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
            }}
          >
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="space-y-1.5 py-2 border-t border-[#E8ECF0]"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
