"use client";

import { X, Bell, FileCheck, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type {
  Notification,
  NotificationType,
} from "@/types/notification.types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; iconBg: string; iconColor: string }
> = {
  DEADLINE: {
    icon: <AlertTriangle className="h-4 w-4" />,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  VALIDATION: {
    icon: <FileCheck className="h-4 w-4" />,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  MEET: {
    icon: <Calendar className="h-4 w-4" />,
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
  },
  // CORRECTION 1 : Bell utilisé ici au lieu de Info (supprime l'erreur "defined but never used")
  SYSTEM: {
    icon: <Bell className="h-4 w-4" />,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
};

export function NotificationItem({
  notification,
  onRead,
  onRemove,
  compact = false,
}: NotificationItemProps) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM;

  return (
    // CORRECTION 2 : role="button" et tabIndex supprimés — évite le contrôle
    // interactif imbriqué avec le <button> "Supprimer" à l'intérieur
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl transition-all duration-150 cursor-pointer",
        compact ? "p-3" : "p-4",
        !notification.isRead
          ? "bg-primary-50/60 hover:bg-primary-50"
          : "bg-white hover:bg-slate-50",
        "border",
        !notification.isRead ? "border-primary-100" : "border-transparent",
      )}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      {/* Indicateur non-lu */}
      {!notification.isRead && (
        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
      )}

      {/* Icône type */}
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
          cfg.iconBg,
          cfg.iconColor,
        )}
      >
        {cfg.icon}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 pr-4">
        <p
          className={cn(
            "text-sm leading-snug truncate",
            !notification.isRead
              ? "font-semibold text-slate-900"
              : "font-medium text-slate-700",
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 mt-1.5">
          {formatDate(notification.createdAt)}
        </p>
      </div>

      {/* Bouton supprimer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        aria-label="Supprimer la notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
