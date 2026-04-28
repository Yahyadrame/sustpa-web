import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReactNode, useState } from "react";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  className?: string;
  icon?: ReactNode;
}

/* ─ Tokens redesignés : bande colorée gauche style OripioFin ── */
const ALERT_CONFIG: Record<
  AlertVariant,
  {
    container: string;
    border: string;
    icon: ReactNode;
    accent: string;
  }
> = {
  info: {
    container: "bg-blue-50/60 text-blue-900",
    border: "border-blue-200",
    accent: "bg-blue-500",
    icon: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,
  },
  success: {
    container: "bg-primary-50/60 text-primary-900",
    border: "border-primary-200",
    accent: "bg-primary-600",
    icon: <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />,
  },
  warning: {
    container: "bg-amber-50/60 text-amber-900",
    border: "border-amber-200",
    accent: "bg-amber-500",
    icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />,
  },
  danger: {
    container: "bg-red-50/60 text-red-900",
    border: "border-red-200",
    accent: "bg-red-500",
    icon: <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  dismissible,
  className,
  icon,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const {
    container,
    border,
    accent,
    icon: defaultIcon,
  } = ALERT_CONFIG[variant];

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-sm overflow-hidden",
        "relative pl-5",
        container,
        border,
        className,
      )}
      role="alert"
    >
      {/* Bande colorée gauche */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", accent)} />

      {icon ?? defaultIcon}

      <div className="flex-1 space-y-0.5 min-w-0">
        {title && <p className="font-semibold tracking-[-0.01em]">{title}</p>}
        <div className="leading-relaxed opacity-90 text-sm">{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="opacity-50 hover:opacity-100 transition-opacity shrink-0 rounded-lg p-0.5 hover:bg-black/5"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
