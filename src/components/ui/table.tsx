import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Table — SUSTPA style OripioFin
   Header gris perle, rows séparées par divider, hover léger
───────────────────────────────────────────────────────────── */

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto rounded-2xl border border-[#E8ECF0] bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.03)]">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("bg-[#F6F8FA] border-b border-[#E8ECF0]", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-[#E8ECF0] bg-white", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-[#F6F8FA]/60", className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left",
        "text-xs font-semibold uppercase tracking-wider text-slate-500",
        "whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3.5 text-slate-700 text-[0.9rem]", className)}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("py-3 text-xs text-slate-400", className)}
      {...props}
    />
  );
}

/* ─── Skeleton tableau ──────────────────────────────────────── */
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  const widths = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-1/3"];
  const headerWidths = ["w-16", "w-24", "w-20", "w-28", "w-14"];

  return (
    <div className="w-full overflow-auto rounded-2xl border border-[#E8ECF0] bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[#F6F8FA] border-b border-[#E8ECF0]">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div
                  className={cn(
                    "animate-pulse h-3 rounded-lg bg-[#E8ECF0]",
                    headerWidths[i % headerWidths.length],
                  )}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8ECF0]">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3.5">
                  <div
                    className={cn(
                      "animate-pulse h-3.5 rounded-lg bg-[#EEF0F3]",
                      widths[(r + c) % widths.length],
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
