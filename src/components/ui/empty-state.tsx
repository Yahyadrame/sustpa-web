import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "md",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "py-8", md: "py-12", lg: "py-20" };
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes[size],
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F8FA] border border-[#E8ECF0] text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-[0.9375rem] font-semibold text-slate-800 tracking-[-0.01em]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
