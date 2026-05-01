import { Skeleton } from "@/components/ui/skeleton";

export default function ChangePasswordLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Skeleton
        className="h-11 w-11 rounded-[13px]"
        style={{ marginBottom: 16 }}
      />
      <Skeleton className="h-7 w-48 rounded-lg" style={{ marginBottom: 6 }} />
      <Skeleton className="h-4 w-56 rounded-md" style={{ marginBottom: 22 }} />
      <Skeleton
        className="h-11 w-full rounded-[10px]"
        style={{ marginBottom: 22 }}
      />
      <Skeleton
        className="h-14 w-full rounded-[10px]"
        style={{ marginBottom: 18 }}
      />
      <Skeleton className="h-3 w-36 rounded-md" style={{ marginBottom: 6 }} />
      <Skeleton
        className="h-14 w-full rounded-[10px]"
        style={{ marginBottom: 14 }}
      />
      <Skeleton
        className="h-11 w-full rounded-[10px]"
        style={{ marginBottom: 14 }}
      />
      <Skeleton className="h-11 w-full rounded-[10px]" />
    </div>
  );
}
