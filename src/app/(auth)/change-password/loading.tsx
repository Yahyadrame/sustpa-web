import { Skeleton } from "@/components/ui/skeleton";

export default function ChangePasswordLoading() {
  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Icône + titre */}
      <div className="space-y-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Stepper */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Info box */}
      <Skeleton className="h-16 w-full rounded-xl" />

      {/* Input OTP */}
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14.5 w-full rounded-[0.625rem]" />
      </div>

      {/* Bouton */}
      <Skeleton className="h-11 w-full rounded-[0.625rem]" />

      {/* Renvoyer */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
