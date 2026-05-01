import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Badge — style OripioFin adapté SUSTPA
   Tokens : radius pill, ring-1, texte bold, lettre-espacement
───────────────────────────────────────────────────────────── */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-full font-semibold tracking-[0.01em]",
    "ring-1 ring-inset",
    "transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-slate-100  text-slate-600   ring-slate-200",
        primary: "bg-primary-50 text-primary-700  ring-primary-200", // vert émeraude
        success: "bg-green-50   text-green-700    ring-green-200",
        warning: "bg-amber-50   text-amber-700    ring-amber-200",
        danger: "bg-red-50     text-red-700      ring-red-200",
        info: "bg-blue-50    text-blue-700     ring-blue-200",
        violet: "bg-violet-50  text-violet-700   ring-violet-200",
        accent: "bg-indigo-50 text-indigo-700 ring-indigo-200",
        /* ── Statuts projets ─────────────────────────────── */
        proposition: "bg-violet-50  text-violet-700   ring-violet-200",
        en_cours: "bg-blue-50    text-blue-700     ring-blue-200",
        soumis: "bg-amber-50   text-amber-700    ring-amber-200",
        soutenu: "bg-primary-50 text-primary-700  ring-primary-200",
        archive: "bg-slate-100  text-slate-500    ring-slate-200",
      },
      size: {
        xs: "px-1.5 py-0   text-[0.625rem]",
        sm: "px-2   py-0   text-[0.6875rem]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3   py-1   text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Affiche un point coloré avant le texte */
  dot?: boolean;
}

const DOT_COLOR: Record<string, string> = {
  default: "bg-slate-400",
  primary: "bg-primary-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  violet: "bg-violet-500",
  accent: "bg-indigo-500",
  proposition: "bg-violet-500",
  en_cours: "bg-blue-500",
  soumis: "bg-amber-500",
  soutenu: "bg-primary-500",
  archive: "bg-slate-400",
};

export function Badge({
  className,
  variant = "default",
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            DOT_COLOR[variant ?? "default"],
          )}
        />
      )}
      {children}
    </span>
  );
}

/* ─── Helper badge statut projet ──────────────────────────── */
const STATUS_LABELS: Record<string, string> = {
  PROPOSITION: "Proposition",
  EN_COURS: "En cours",
  SOUMIS: "Soumis",
  SOUTENU: "Soutenu",
  ARCHIVE: "Archivé",
};

const STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  PROPOSITION: "proposition",
  EN_COURS: "en_cours",
  SOUMIS: "soumis",
  SOUTENU: "soutenu",
  ARCHIVE: "archive",
};

export function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "default"} dot>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

/* ─── Helper badge validation sujet ─────────────────────────── */
const SUBJECT_STATUS_LABELS: Record<string, string> = {
  PENDING_VALIDATION: "En attente",
  VALIDATED: "Validé",
  REJECTED: "Refusé",
  CLOSED: "Clôturé",
};

const SUBJECT_STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  PENDING_VALIDATION: "warning",
  VALIDATED: "success",
  REJECTED: "danger",
  CLOSED: "archive",
};

export function SubjectStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={SUBJECT_STATUS_VARIANTS[status] ?? "default"} dot>
      {SUBJECT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
