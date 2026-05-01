import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Titre */}
      <Skeleton className="h-8 w-40 rounded-lg" style={{ marginBottom: 6 }} />
      <Skeleton className="h-4 w-56 rounded-md" style={{ marginBottom: 28 }} />

      {/* Champs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Skeleton
            className="h-3 w-24 rounded-md"
            style={{ marginBottom: 6 }}
          />
          <Skeleton className="h-11 w-full rounded-[10px]" />
        </div>
        <div>
          <Skeleton
            className="h-3 w-28 rounded-md"
            style={{ marginBottom: 6 }}
          />
          <Skeleton className="h-11 w-full rounded-[10px]" />
        </div>
      </div>

      {/* Remember row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>

      {/* Bouton */}
      <Skeleton
        className="h-11 w-full rounded-[10px]"
        style={{ marginTop: 22 }}
      />

      {/* Divider */}
      <Skeleton
        className="h-4 w-8 rounded-md mx-auto"
        style={{ marginTop: 20, marginBottom: 20 }}
      />

      {/* Bouton secondaire */}
      <Skeleton className="h-11 w-full rounded-[10px]" />

      {/* Bas */}
      <Skeleton
        className="h-4 w-48 rounded-md mx-auto"
        style={{ marginTop: 20 }}
      />
    </div>
  );
}
