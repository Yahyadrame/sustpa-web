"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Dialog — modal SUSTPA style OripioFin
   Overlay blur, panel blanc radius-2xl, animation scale-in
───────────────────────────────────────────────────────────── */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  /** Masque la croix de fermeture */
  hideClose?: boolean;
}

const SIZES: Record<NonNullable<DialogProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-3xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  hideClose = false,
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Fermeture Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Scroll-lock body */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[6px]"
        style={{ animation: "fadeIn 0.15s ease-out" }}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl flex flex-col max-h-[90vh]",
          "border border-[#E8ECF0]",
          "shadow-[0_24px_48px_-12px_rgb(0_0_0/0.18),0_0_0_1px_rgb(0_0_0/0.04)]",
          SIZES[size],
          className,
        )}
        style={{ animation: "scaleIn 0.18s cubic-bezier(0.16,1,0.3,1)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#E8ECF0] shrink-0">
            <div className="space-y-1 pr-4 min-w-0">
              {title && (
                <h2
                  id="dialog-title"
                  className="text-[1.0625rem] font-semibold text-slate-900 tracking-[-0.02em] leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className={cn(
                  "rounded-xl p-1.5 shrink-0",
                  "text-slate-400 hover:text-slate-700",
                  "hover:bg-[#F6F8FA]",
                  "transition-colors duration-150",
                )}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Bouton fermeture sans header */}
        {!title && !description && !hideClose && (
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 rounded-xl p-1.5",
              "text-slate-400 hover:text-slate-700",
              "hover:bg-[#F6F8FA]",
              "transition-colors duration-150 z-10",
            )}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Contenu */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ─── Footer de dialog ──────────────────────────────────────── */
export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3",
        "pt-4 mt-2 border-t border-[#E8ECF0]",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Section dans dialog ───────────────────────────────────── */
export function DialogSection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#F6F8FA] border border-[#E8ECF0] p-4",
        className,
      )}
      {...props}
    />
  );
}
