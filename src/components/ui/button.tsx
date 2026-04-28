"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-[0.625rem] font-medium tracking-[-0.01em]",
    "font-sans transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Vert émeraude — action principale SUSTPA */
        primary: [
          "bg-gradient-to-br from-primary-600 to-primary-700",
          "text-white",
          "shadow-[0_1px_3px_rgb(27_138_90/0.30),0_4px_12px_-2px_rgb(27_138_90/0.20)]",
          "hover:from-primary-500 hover:to-primary-600",
          "hover:shadow-[0_4px_16px_-2px_rgb(27_138_90/0.40)]",
          "focus-visible:ring-primary-600",
        ].join(" "),

        /** Blanc avec bordure légère */
        secondary: [
          "bg-white text-slate-700",
          "border border-[#E8ECF0] hover:border-[#C8CDD5]",
          "hover:bg-[#F6F8FA]",
          "shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
          "focus-visible:ring-primary-600",
        ].join(" "),

        /** Transparent */
        ghost: [
          "text-slate-600 hover:bg-[#F6F8FA] hover:text-slate-900",
          "focus-visible:ring-primary-600",
        ].join(" "),

        /** Rouge danger */
        danger: [
          "bg-red-600 text-white",
          "shadow-[0_1px_3px_rgb(220_38_38/0.25)]",
          "hover:bg-red-700",
          "focus-visible:ring-red-500",
        ].join(" "),

        /** Lien textuel vert */
        link: [
          "text-primary-600 underline-offset-4 hover:underline",
          "focus-visible:ring-primary-600",
        ].join(" "),

        /** Outline vert émeraude */
        outline: [
          "bg-transparent text-primary-700",
          "border-[1.5px] border-primary-600",
          "hover:bg-primary-50",
          "focus-visible:ring-primary-600",
        ].join(" "),
      },
      size: {
        xs: "h-7  px-2.5 text-xs gap-1",
        sm: "h-8  px-3.5 text-sm",
        md: "h-10 px-4   text-[0.9375rem]",
        lg: "h-11 px-6   text-base",
        xl: "h-12 px-8   text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, children, disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
