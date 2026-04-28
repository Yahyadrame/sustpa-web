"use client";

import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

const VARIANT_STYLES = {
  default: {
    icon: "bg-slate-100 text-slate-600",
    value: "text-slate-900",
  },
  primary: {
    icon: "bg-primary-50 text-primary-600",
    value: "text-primary-700",
  },
  success: {
    icon: "bg-green-50 text-green-600",
    value: "text-green-700",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600",
    value: "text-amber-700",
  },
  danger: {
    icon: "bg-red-50 text-red-600",
    value: "text-red-700",
  },
};

const TREND_ICONS = {
  up: <TrendingUp className="h-3.5 w-3.5 text-green-500" />,
  down: <TrendingDown className="h-3.5 w-3.5 text-red-500" />,
  neutral: <Minus className="h-3.5 w-3.5 text-slate-400" />,
};

export function AdminStatsCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendLabel,
  variant = "default",
  className,
}: AdminStatsCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-border p-5 shadow-card",
        "hover:shadow-md transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className={cn("text-2xl font-bold tabular-nums", styles.value)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            styles.icon,
          )}
        >
          {icon}
        </div>
      </div>

      {trend && trendLabel && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5">
          {TREND_ICONS[trend]}
          <span className="text-xs text-slate-500">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
