"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
  max?: number;
}

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

// ─── Palette par défaut ───────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#d97706",
];

// ══════════════════════════════════════════════════════════════════════════════
// BAR CHART
// ══════════════════════════════════════════════════════════════════════════════

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  showValues?: boolean;
  className?: string;
  height?: number;
}

export function BarChart({
  data,
  title,
  showValues = true,
  className,
}: BarChartProps) {
  const uid = useId().replace(/:/g, "");
  const globalMax = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
      )}

      <div className="space-y-2.5">
        {data.map((item, idx) => {
          const max = item.max ?? globalMax;
          const pct = max > 0 ? Math.round((item.value / max) * 100) : 0;
          const color =
            item.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          const barClass = `bar-${uid}-${idx}`;

          return (
            <div key={item.label} className="space-y-1">
              <style>{`.${barClass}{width:${pct}%;background:${color};}`}</style>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 truncate max-w-[60%]">
                  {item.label}
                </span>
                {showValues && (
                  <span className="text-sm font-bold text-slate-800 shrink-0">
                    {item.value}
                  </span>
                )}
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DONUT CHART
// ══════════════════════════════════════════════════════════════════════════════

interface DonutChartProps {
  data: DonutChartData[];
  title?: string;
  size?: number;
  thickness?: number;
  className?: string;
  centerLabel?: string;
}

export function DonutChart({
  data,
  title,
  size = 160,
  thickness = 28,
  className,
  centerLabel,
}: DonutChartProps) {
  const uid = useId().replace(/:/g, "");
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<
    Array<DonutChartData & { dash: number; gap: number; offset: number }>
  >((acc, item) => {
    const prev = acc.reduce((sum, s) => sum + s.dash / circumference, 0);
    const pct = total > 0 ? item.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const offset = circumference - prev * circumference;
    return [...acc, { ...item, dash, gap, offset }];
  }, []);

  const boxClass = `donut-box-${uid}`;

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </p>
      )}

      <div className="flex items-center gap-6 flex-wrap">
        {/* ✅ CORRIGÉ — `relative` ajouté pour positionner le label central */}
        <style>{`.${boxClass}{--chart-w:${size}px;--chart-h:${size}px;}`}</style>
        <div className={`chart-size-box ${boxClass} relative`}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
          >
            {/* Fond gris */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={thickness}
            />

            {/* Segments */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${seg.dash} ${seg.gap}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="round"
                className="donut-segment"
              />
            ))}
          </svg>

          {/* Label central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel ? (
              <span className="text-lg font-black text-slate-800">
                {centerLabel}
              </span>
            ) : (
              <>
                <span className="text-xl font-black text-slate-800">
                  {total}
                </span>
                <span className="text-xs text-slate-400">total</span>
              </>
            )}
          </div>
        </div>

        {/* Légende */}
        <div className="flex-1 space-y-2 min-w-0">
          {data.map((item, idx) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const dotClass = `dot-${uid}-${idx}`;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <style>{`.${dotClass}{background:${item.color};}`}</style>
                <div
                  className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotClass}`}
                />
                <span className="text-xs text-slate-600 flex-1 truncate">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-slate-800 shrink-0">
                  {item.value}
                </span>
                <span className="text-xs text-slate-400 shrink-0 w-8 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SPARKLINE
// ══════════════════════════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  filled?: boolean;
}

export function Sparkline({
  data,
  color = "#2563eb",
  width = 120,
  height = 40,
  filled = true,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      {filled && (
        <polygon
          points={`0,${height} ${polyline} ${width},${height}`}
          fill={color}
          fillOpacity={0.12}
        />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.split(",")[0]}
        cy={last.split(",")[1]}
        r={3}
        fill={color}
      />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STAT ROW
// ══════════════════════════════════════════════════════════════════════════════

interface StatRowProps {
  label: string;
  value: number | string;
  trend?: number;
  icon?: React.ReactNode;
  sparkData?: number[];
  className?: string;
}

export function StatRow({
  label,
  value,
  trend,
  icon,
  sparkData,
  className,
}: StatRowProps) {
  const trendPositive = (trend ?? 0) >= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 border-b border-slate-100 last:border-0",
        className,
      )}
    >
      {icon && (
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>

      {sparkData && sparkData.length > 1 && (
        <Sparkline data={sparkData} width={60} height={28} />
      )}

      {trend !== undefined && (
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
            trendPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700",
          )}
        >
          {trendPositive ? "+" : ""}
          {trend}%
        </span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRESS RING
// ══════════════════════════════════════════════════════════════════════════════

interface ProgressRingProps {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 80,
  thickness = 8,
  color = "#2563eb",
  label,
  className,
}: ProgressRingProps) {
  const uid = useId().replace(/:/g, "");
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(value, 100) / 100) * circumference;
  const gap = circumference - dash;
  const boxClass = `ring-box-${uid}`;

  return (
    <>
      <style>{`.${boxClass}{--chart-w:${size}px;--chart-h:${size}px;}`}</style>
      {/* ✅ CORRIGÉ — `relative` ajouté pour positionner la valeur centrale */}
      <div
        className={cn(
          "inline-flex items-center justify-center chart-size-box relative",
          boxClass,
          className,
        )}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            className="progress-ring-arc"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-black text-slate-800">{value}%</span>
          {label && (
            <span className="text-[9px] text-slate-400 leading-tight text-center px-1">
              {label}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
