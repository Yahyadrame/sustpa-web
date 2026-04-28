"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationItem } from "./notification-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotif } =
    useNotifications();

  // Fermeture clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Fermeture touche Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-50 w-95 max-h-130 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 animate-scale-in overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-slate-800">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* CORRECTION : onClick={() => onClose()} au lieu de onClick={onClose}
            pour éviter le mismatch de type () => void vs ReactNode            */}
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Tout lire
          </Button>
        )}
      </div>

      {/* ── Liste ── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title="Aucune notification"
            description="Vous êtes à jour."
            size="sm"
          />
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markAsRead}
              onRemove={removeNotif}
              compact
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="px-4 py-3">
            {/* CORRECTION : <Link> complet — la balise ouvrante était manquante */}
            <Link
              href="/notifications"
              onClick={() => onClose()}
              className="block text-center text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Voir toutes les notifications &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
