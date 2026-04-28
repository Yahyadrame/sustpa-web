import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   StatCard — style OripioFin adapté SUSTPA
   ─ Variante "primary" : dégradé vert émeraude avec ombre colorée
   ─ Variante "default" : blanc, icône dans pastille colorée
   ─ Tendance haussière/baissière avec flèche
───────────────────────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number; // % positif = hausse, négatif = baisse
  trendLabel?: string;
  /** Sous-valeur ou détail (ex: "sur 30 jours") */
  subtitle?: string;
  variant?: "default" | "primary" | "blue" | "amber" | "red" | "violet";
  className?: string;
  /** Lien "Voir détail" type OripioFin */
  onAction?: () => void;
  actionLabel?: string;
}

/* Tokens par variante */
const V = {
  default: {
    card: "bg-white border border-[#E8ECF0] shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_6px_0_rgb(0_0_0/0.05)]",
    icon: "bg-[#F6F8FA] text-slate-600",
    title: "text-slate-500",
    value: "text-slate-900",
    trend_p: "text-primary-600",
    trend_n: "text-red-600",
    trend_0: "text-slate-400",
  },
  primary: {
    card: "bg-gradient-to-br from-primary-600 to-primary-800 border-transparent shadow-[0_8px_24px_-4px_rgb(27_138_90/0.40)]",
    icon: "bg-white/20 text-white",
    title: "text-white/75",
    value: "text-white",
    trend_p: "text-white/90",
    trend_n: "text-red-300",
    trend_0: "text-white/50",
  },
  blue: {
    card: "bg-gradient-to-br from-blue-600 to-blue-800 border-transparent shadow-[0_8px_24px_-4px_rgb(37_99_235/0.35)]",
    icon: "bg-white/20 text-white",
    title: "text-white/75",
    value: "text-white",
    trend_p: "text-white/90",
    trend_n: "text-red-300",
    trend_0: "text-white/50",
  },
  amber: {
    card: "bg-white border border-[#E8ECF0] shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_6px_0_rgb(0_0_0/0.05)]",
    icon: "bg-amber-50 text-amber-600",
    title: "text-slate-500",
    value: "text-slate-900",
    trend_p: "text-primary-600",
    trend_n: "text-red-600",
    trend_0: "text-slate-400",
  },
  red: {
    card: "bg-white border border-[#E8ECF0] shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_6px_0_rgb(0_0_0/0.05)]",
    icon: "bg-red-50 text-red-600",
    title: "text-slate-500",
    value: "text-slate-900",
    trend_p: "text-primary-600",
    trend_n: "text-red-600",
    trend_0: "text-slate-400",
  },
  violet: {
    card: "bg-white border border-[#E8ECF0] shadow-[0_0_0_1px_rgb(0_0_0/0.03),0_2px_6px_0_rgb(0_0_0/0.05)]",
    icon: "bg-violet-50 text-violet-600",
    title: "text-slate-500",
    value: "text-slate-900",
    trend_p: "text-primary-600",
    trend_n: "text-red-600",
    trend_0: "text-slate-400",
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  subtitle,
  variant = "default",
  className,
  onAction,
  actionLabel = "Voir détails →",
}: StatCardProps) {
  const v = V[variant];

  const trendColor =
    trend === undefined
      ? ""
      : trend > 0
        ? v.trend_p
        : trend < 0
          ? v.trend_n
          : v.trend_0;

  const TrendIcon =
    trend === undefined
      ? null
      : trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus;

  return (
    <div
      className={cn(
        "rounded-2xl p-5 space-y-3 transition-all duration-200",
        "hover:-translate-y-0.5",
        v.card,
        className,
      )}
    >
      {/* Ligne 1 : titre + icône */}
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-sm font-medium tracking-[-0.01em] leading-snug",
            v.title,
          )}
        >
          {title}
        </p>
        {icon && (
          <div
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
              v.icon,
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Ligne 2 : valeur principale */}
      <p
        className={cn(
          "text-[1.875rem] font-bold tracking-[-0.04em] leading-none",
          v.value,
        )}
      >
        {value}
      </p>

      {/* Ligne 3 : tendance + sous-texte */}
      {(trend !== undefined || trendLabel || subtitle) && (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {(trend !== undefined || trendLabel) && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trendColor,
              )}
            >
              {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
              {trend !== undefined && (
                <span>
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
              )}
              {trendLabel && (
                <span
                  className={cn(
                    "font-normal",
                    variant === "primary" || variant === "blue"
                      ? "text-white/60"
                      : "text-slate-400",
                  )}
                >
                  {trendLabel}
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <span
              className={cn(
                "text-xs",
                variant === "primary" || variant === "blue"
                  ? "text-white/60"
                  : "text-slate-400",
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Action optionnelle style OripioFin */}
      {onAction && (
        <>
          <div
            className={cn(
              "border-t pt-3 mt-1",
              variant === "primary" || variant === "blue"
                ? "border-white/20"
                : "border-[#E8ECF0]",
            )}
          />
          <button
            onClick={onAction}
            className={cn(
              "text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-80",
              variant === "primary" || variant === "blue"
                ? "text-white/80"
                : "text-primary-600",
            )}
          >
            {actionLabel}
          </button>
        </>
      )}
    </div>
  );
}
