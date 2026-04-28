"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Tabs — SUSTPA style OripioFin
   Underline active vert émeraude, fond gris perle au hover
───────────────────────────────────────────────────────────── */

interface TabsContextValue {
  active: string;
  setActive: (v: string) => void;
}
const TabsContext = createContext<TabsContextValue>({
  active: "",
  setActive: () => {},
});

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  children,
  className,
  onChange,
}: TabsProps) {
  const [active, setActive] = useState(defaultValue);
  const handleChange = (v: string) => {
    setActive(v);
    onChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  /** Variante "pills" : fond gris avec pastilles */
  variant = "underline",
}: {
  children: ReactNode;
  className?: string;
  variant?: "underline" | "pills";
}) {
  return (
    <div
      className={cn(
        variant === "underline" &&
          "flex items-center gap-0.5 border-b border-[#E8ECF0]",
        variant === "pills" &&
          "flex items-center gap-1.5 bg-[#F6F8FA] rounded-xl p-1",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
  badge?: number;
  className?: string;
  variant?: "underline" | "pills";
}

export function TabsTrigger({
  value,
  children,
  icon,
  badge,
  className,
  variant = "underline",
}: TabsTriggerProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      className={cn(
        "flex items-center gap-2 text-sm font-medium tracking-[-0.01em]",
        "transition-all duration-150 focus-visible:outline-none",
        variant === "underline" && [
          "relative px-4 py-3",
          isActive
            ? "text-primary-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600 after:rounded-t-full"
            : "text-slate-500 hover:text-slate-700 hover:bg-[#F6F8FA] rounded-t-lg",
        ],
        variant === "pills" && [
          "rounded-lg px-3.5 py-2",
          isActive
            ? "bg-white text-slate-900 shadow-[0_1px_3px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)]"
            : "text-slate-500 hover:text-slate-700",
        ],
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-xs font-semibold text-primary-700">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      className={cn("pt-5", className)}
      style={{ animation: "fadeIn 0.18s ease-out" }}
    >
      {children}
    </div>
  );
}
