import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Spinner — indicateur de chargement SUSTPA
   Couleur héritée du texte courant (text-current)
───────────────────────────────────────────────────────────── */

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      className={cn(
        "animate-spin text-current shrink-0",
        SIZES[size],
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Chargement"
      role="status"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─── Full-page loader ──────────────────────────────────────── */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F6F8FA]">
      <div className="flex flex-col items-center gap-4">
        {/* Logo simplifié */}
        <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-[0_8px_24px_-4px_rgb(27_138_90/0.4)]">
          <span className="text-white font-bold text-lg tracking-tight">S</span>
        </div>
        <Spinner size="md" className="text-primary-600" />
      </div>
    </div>
  );
}
