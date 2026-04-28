import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Card — composant central SUSTPA
   Style OripioFin : fond blanc, radius 16px, ombre douce,
   bordure fine gris perle, hover avec bordure verte subtile
───────────────────────────────────────────────────────────── */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Active l'effet hover élévation + bordure verte */
  hover?: boolean;
  /** Supprime le padding par défaut */
  noPadding?: boolean;
  /** Variante colorée pour les stat cards */
  variant?: "default" | "primary" | "ghost";
}

export function Card({ className, hover, noPadding, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        /* Variantes de surface */
        variant === "default" && [
          "bg-white border-[#E8ECF0]",
          "shadow-card",
        ],
        variant === "primary" && [
          "bg-linear-to-br from-primary-600 to-primary-800",
          "border-transparent text-white",
          "shadow-[0_8px_24px_-4px_rgb(27_138_90/0.35)]",
        ],
        variant === "ghost" && [
          "bg-[#F6F8FA] border-[#E8ECF0]",
          "shadow-none",
        ],
        /* Hover */
        hover && [
          "transition-all duration-200 cursor-pointer",
          "hover:-translate-y-0.5",
          variant === "default" && "hover:shadow-card-hover hover:border-primary-200",
          variant === "ghost"   && "hover:bg-white hover:shadow-[0_0_0_1px_rgb(0_0_0/0.05),0_4px_12px_-2px_rgb(0_0_0/0.08)]",
        ],
        !noPadding && "p-6",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[1.0625rem] font-semibold text-slate-900 tracking-[-0.02em] leading-snug",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-500 leading-relaxed", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center pt-4 mt-4",
        "border-t border-[#E8ECF0]",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Divider interne ───────────────────────────────────────── */
export function CardDivider({ className }: { className?: string }) {
  return <hr className={cn("border-[#E8ECF0] my-4 -mx-6", className)} />;
}