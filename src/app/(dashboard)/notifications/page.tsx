"use client";

import { Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { useState } from "react";

import { useNotifications } from "@/hooks/use-notifications";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationType } from "@/types/notification.types";

const TYPE_OPTIONS: { value: NotificationType | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "DEADLINE", label: "⏰ Échéances" },
  { value: "VALIDATION", label: "✅ Validations" },
  { value: "MEET", label: "📅 Sessions Meet" },
  { value: "SYSTEM", label: "🔧 Système" },
];

const READ_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "unread", label: "Non lues" },
  { value: "read", label: "Lues" },
];

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotif,
    removeAll,
  } = useNotifications();

  // NotificationType utilisé pour typer le filtre
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [readFilter, setReadFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = notifications.filter((n) => {
    const matchType = !typeFilter || n.type === typeFilter;
    const matchRead =
      !readFilter ||
      (readFilter === "unread" && !n.isRead) ||
      (readFilter === "read" && n.isRead);
    return matchType && matchRead;
  });

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Tout est à jour"
        }
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Notifications" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Tout marquer comme lu
              </Button>
            )}
            {/* Trash2 — supprimer toutes les notifications */}
            {notifications.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={removeAll}
                title="Supprimer toutes les notifications"
                aria-label="Supprimer toutes les notifications"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Tout supprimer
              </Button>
            )}
          </div>
        }
      />

      {/* Filtres — toggle via bouton Filter */}
      <div className="space-y-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filtres
        </Button>

        {showFilters && (
          <div
            id="filter-panel"
            className="flex gap-3 flex-wrap p-4 bg-slate-50 border border-slate-200 rounded-xl animate-slide-down"
          >
            <div className="w-48">
              <Select
                label="Type"
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={(v) => setTypeFilter(v as NotificationType | "")}
                placeholder="Type"
              />
            </div>
            <div className="w-36">
              <Select
                label="Statut"
                options={READ_OPTIONS}
                value={readFilter}
                onChange={setReadFilter}
                placeholder="Statut"
              />
            </div>
          </div>
        )}
      </div>

      {/* Skeleton — état de chargement */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white"
            >
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="Aucune notification"
          description="Vous n'avez aucune notification pour ces filtres."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={markAsRead}
              onRemove={removeNotif}
            />
          ))}
        </div>
      )}
    </div>
  );
}
