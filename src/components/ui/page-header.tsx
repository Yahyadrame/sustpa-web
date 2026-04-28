import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   PageHeader — en-tête de page SUSTPA
   Style OripioFin : breadcrumb chevron, titre gras, actions droite
───────────────────────────────────────────────────────────── */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  /** Badge ou tag affiché à côté du titre */
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumb style OripioFin */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          className="mb-2 flex items-center gap-1 text-xs text-slate-400"
          aria-label="Fil d'Ariane"
        >
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-600 font-medium">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Titre + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[1.625rem] font-bold text-slate-900 tracking-[-0.03em] leading-tight truncate">
              {title}
            </h1>
            {badge && badge}
          </div>
          {description && (
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
