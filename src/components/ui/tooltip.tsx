"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIDE_CLASSES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full  left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2  mr-2",
  right: "left-full  top-1/2 -translate-y-1/2  ml-2",
};

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 pointer-events-none whitespace-nowrap",
            "rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white",
            "shadow-[0_4px_12px_-2px_rgb(0_0_0/0.20)]",
            SIDE_CLASSES[side],
            className,
          )}
          style={{ animation: "fadeIn 0.12s ease-out" }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
