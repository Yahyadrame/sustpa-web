import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: string;
  optional?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, hint, optional, children, ...props }, ref) => (
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <label
        ref={ref}
        className={cn(
          "block text-sm font-medium text-slate-700",
          "tracking-[-0.01em] leading-none",
          className,
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <span className="text-xs text-slate-400 font-normal leading-none">
          {hint}
        </span>
      )}
      {optional && !hint && (
        <span className="text-xs text-slate-400 font-normal leading-none">
          Optionnel
        </span>
      )}
    </div>
  ),
);
Label.displayName = "Label";
