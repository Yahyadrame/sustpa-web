"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";

/* ─────────────────────────────────────────────────────────────
   Toast — notifications éphémères SUSTPA
   Style OripioFin : blanc, ombre douce, accent coloré gauche,
   animation slide-up depuis le bas droite
───────────────────────────────────────────────────────────── */

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/* ─── Store Zustand ─────────────────────────────────────────── */
interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/* ─── Hook utilitaire ───────────────────────────────────────── */
export function useToast() {
  const { add } = useToastStore();
  return {
    success: (title: string, message?: string) =>
      add({ type: "success", title, message }),
    error: (title: string, message?: string) =>
      add({ type: "error", title, message }),
    warning: (title: string, message?: string) =>
      add({ type: "warning", title, message }),
    info: (title: string, message?: string) =>
      add({ type: "info", title, message }),
  };
}

/* ─── Config par type ───────────────────────────────────────── */
const CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; accent: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    accent: "bg-primary-600", // vert émeraude SUSTPA
    iconColor: "text-primary-600",
  },
  error: {
    icon: <XCircle className="h-5 w-5 shrink-0" />,
    accent: "bg-red-500",
    iconColor: "text-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 shrink-0" />,
    accent: "bg-amber-500",
    iconColor: "text-amber-500",
  },
  info: {
    icon: <Info className="h-5 w-5 shrink-0" />,
    accent: "bg-blue-500",
    iconColor: "text-blue-500",
  },
};

/* ─── Toast individuel ──────────────────────────────────────── */
function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToastStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => remove(toast.id), 300);
    }, toast.duration ?? 4500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, remove]);

  const { icon, accent, iconColor } = CONFIG[toast.type];

  return (
    <div
      className={cn(
        "flex items-start overflow-hidden rounded-2xl",
        "bg-white border border-[#E8ECF0]",
        "shadow-[0_8px_24px_-4px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.04)]",
        "max-w-88 w-full",
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3 scale-[0.97]",
      )}
      role="alert"
    >
      {/* Bande colorée gauche */}
      <div className={cn("w-1 self-stretch shrink-0 rounded-l-2xl", accent)} />

      <div className="flex items-start gap-3 px-4 py-3.5 flex-1 min-w-0">
        {/* Icône */}
        <span className={cn("mt-0.5 shrink-0", iconColor)}>{icon}</span>

        {/* Textes */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-slate-900 tracking-[-0.01em] leading-tight">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-slate-500 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        {/* Bouton fermer */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => remove(toast.id), 300);
          }}
          className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-[#F6F8FA] transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Conteneur global ──────────────────────────────────────── */
export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-9999 flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
