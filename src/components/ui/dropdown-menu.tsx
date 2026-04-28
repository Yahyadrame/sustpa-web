"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   DropdownMenu — SUSTPA style OripioFin
   Panel blanc, radius-xl, ombre douce, items avec hover gris perle
───────────────────────────────────────────────────────────── */

export type DropdownItem =
  | {
      label: string;
      icon?: ReactNode;
      onClick?: () => void;
      href?: string;
      variant?: "default" | "danger";
      disabled?: boolean;
      separator?: never;
    }
  | {
      separator: true;
      label?: never;
      icon?: never;
      onClick?: never;
      href?: never;
      variant?: never;
      disabled?: never;
    };

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  /** Largeur du panel (défaut: w-52) */
  width?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
  width = "w-52",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer focus:outline-none"
      >
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 rounded-2xl",
            "border border-[#E8ECF0] bg-white",
            "shadow-[0_12px_32px_-8px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.04)]",
            width,
            align === "right" ? "right-0" : "left-0",
          )}
          style={{ animation: "scaleIn 0.15s cubic-bezier(0.16,1,0.3,1)" }}
          role="menu"
        >
          <div className="p-1.5">
            {items.map((item, i) => {
              if (item.separator) {
                return (
                  <div
                    key={`sep-${i}`}
                    className="my-1 border-t border-[#E8ECF0]"
                  />
                );
              }

              const baseClasses = cn(
                "flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5",
                "text-sm font-medium tracking-[-0.01em]",
                "transition-colors duration-100 text-left",
                item.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-[#F6F8FA]",
                item.disabled && "opacity-40 pointer-events-none",
              );

              const content = (
                <>
                  {item.icon && (
                    <span className="shrink-0 text-slate-400">{item.icon}</span>
                  )}
                  <span className="truncate">{item.label}</span>
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className={baseClasses}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={baseClasses}
                  role="menuitem"
                  disabled={item.disabled}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
