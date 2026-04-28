import { cn } from "@/lib/utils";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  label?: string;
}

export function Separator({
  orientation = "horizontal",
  className,
  label,
}: SeparatorProps) {
  if (orientation === "vertical")
    return (
      <div
        className={cn("w-px self-stretch bg-[#E8ECF0]", className)}
        role="separator"
      />
    );
  if (label)
    return (
      <div className={cn("flex items-center gap-3 my-4", className)}>
        <div className="flex-1 border-t border-[#E8ECF0]" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 border-t border-[#E8ECF0]" />
      </div>
    );
  return (
    <hr
      className={cn("border-t border-[#E8ECF0] my-4", className)}
      role="separator"
    />
  );
}
