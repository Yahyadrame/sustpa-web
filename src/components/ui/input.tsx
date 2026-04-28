"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  /** Icône placée à gauche dans l'input */
  leftIcon?: React.ReactNode;
  /** Icône/bouton placé à droite dans l'input */
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, error, label, hint, id, leftIcon, rightElement, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId =
      id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? generatedId;
    const innerRef = React.useRef<HTMLInputElement>(null);

    const mergedRef = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.setAttribute("aria-invalid", error ? "true" : "false");
      }
    }, [error]);

    const { "aria-invalid": _omit, ...safeProps } = props as Record<
      string,
      unknown
    > &
      typeof props;

    return (
      <div className="w-full space-y-1.5">
        {/* Label + hint */}
        {(label || hint) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={inputId}
                className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
              >
                {label}
              </label>
            )}
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
          </div>
        )}

        {/* Wrapper relatif pour les icônes */}
        <div className="relative">
          {/* Icône gauche */}
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={mergedRef}
            id={inputId}
            className={cn(
              "w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white",
              "px-4 py-2.75 text-[0.9375rem] text-slate-900",
              "font-sans tracking-[-0.01em]",
              "placeholder:text-slate-400",
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
              leftIcon && "pl-10",
              rightElement && "pr-10",
              className,
            )}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...safeProps}
          />

          {/* Élément droit (icône, bouton visible/masqué mdp…) */}
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightElement}
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
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
Input.displayName = "Input";
