import { cn } from "@/lib/utils";
import React from "react";

/* ─────────────────────────────────────────────────────────────
   Skeleton — shimmer OripioFin
   Dégradé horizontal animé gris perle → gris clair
───────────────────────────────────────────────────────────── */

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl",
        "bg-linear-to-r from-[#EEF0F3] via-[#F6F8FA] to-[#EEF0F3]",
        "bg-size-[200%_100%]",
        className,
      )}
      style={{
        animation: "skeletonShimmer 1.8s ease-in-out infinite",
      }}
      {...props}
    />
  );
}

/* ─── Texte multi-lignes ──────────────────────────────────── */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  /** Largeur de la dernière ligne (ex: "60%") */
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = "65%",
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{
            width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Skeleton carte stat ─────────────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/* ─── Skeleton carte projet ───────────────────────────────── */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/* ─── Skeleton ligne de tableau ───────────────────────────── */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  const widths = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-1/3"];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, c) => (
        <td key={c} className="px-4 py-3.5">
          <Skeleton className={cn("h-3.5", widths[c % widths.length])} />
        </td>
      ))}
    </tr>
  );
}

/* ─── Style global shimmer (injecté une fois) ─────────────── */
/* Note : l'animation @keyframes est déclarée dans globals.css */
