"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  options: SelectOption[];
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      hint,
      placeholder,
      className,
      id,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId =
      id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? generatedId;

    return (
      <div className="w-full space-y-1.5">
        {/* Label + hint */}
        {(label || hint) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={selectId}
                className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
              >
                {label}
              </label>
            )}
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
          </div>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none rounded-[0.625rem]",
              "border-[1.5px] border-[#E8ECF0] bg-white",
              "px-4 py-2.75 pr-10",
              "text-[0.9375rem] text-slate-900 font-sans tracking-[-0.01em]",
              "transition-all duration-150",
              "hover:border-[#C8CDD5]",
              "focus:outline-none focus:border-primary-600",
              "focus:shadow-[0_0_0_3px_rgb(27_138_90/0.12)]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F6F8FA]",
              error && [
                "border-red-400",
                "focus:border-red-500",
                "focus:shadow-[0_0_0_3px_rgb(239_68_68/0.12)]",
              ],
              className,
            )}
            onChange={(e) => onChange?.(e.target.value)}
            {...(error
              ? {
                  "aria-invalid": "true",
                  "aria-describedby": `${selectId}-error`,
                }
              : {})}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="flex items-center gap-1 text-xs text-red-600"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
