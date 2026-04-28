import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "danger" | "auto";
  className?: string;
  animated?: boolean;
}

const SIZES = { xs: "h-1", sm: "h-1.5", md: "h-2.5", lg: "h-4" };
const VARIANTS = {
  primary: "bg-primary-600",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  auto: "",
};

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  variant = "auto",
  className,
  animated = false,
}: ProgressProps) {
  const pct = Math.round(Math.min(100, Math.max(0, (value / max) * 100)));
  const resolvedVariant =
    variant !== "auto"
      ? variant
      : pct >= 75
        ? "success"
        : pct >= 40
          ? "primary"
          : "warning";

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-slate-600 tracking-[-0.01em]">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-semibold text-slate-700">{pct}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-[#EEF0F3]",
          SIZES[size],
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progression"}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            VARIANTS[resolvedVariant],
            animated && "animate-pulse",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
