"use client";

import { Clock, User2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types/admin.types";

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
}

const ACTION_META: Record<string, { label: string; color: string }> = {
  PROJECT_CREATED: { label: "Projet créé", color: "bg-blue-50  text-blue-700" },
  PROJECT_APPROVED: {
    label: "Projet validé",
    color: "bg-green-50 text-green-700",
  },
  PROJECT_REJECTED: {
    label: "Projet refusé",
    color: "bg-red-50   text-red-700",
  },
  PROJECT_ARCHIVED: {
    label: "Projet archivé",
    color: "bg-slate-100 text-slate-600",
  },
  SUPERVISOR_ASSIGNED: {
    label: "Encadrant affecté",
    color: "bg-indigo-50 text-indigo-700",
  },
  DELIVERABLE_UPLOADED: {
    label: "Livrable déposé",
    color: "bg-sky-50   text-sky-700",
  },
  DELIVERABLE_APPROVED: {
    label: "Livrable approuvé",
    color: "bg-green-50 text-green-700",
  },
  DELIVERABLE_REVISION: {
    label: "Révision demandée",
    color: "bg-amber-50 text-amber-700",
  },
  ROLE_CHANGED: {
    label: "Rôle modifié",
    color: "bg-purple-50 text-purple-700",
  },
  PASSWORD_RESET_FORCED: {
    label: "Réinit. mot de passe",
    color: "bg-orange-50 text-orange-700",
  },
  BULK_ACTIVATE: {
    label: "Activation en masse",
    color: "bg-green-50 text-green-700",
  },
  BULK_DEACTIVATE: {
    label: "Désactivation en masse",
    color: "bg-red-50   text-red-700",
  },
  BULK_EMAIL_SENT: {
    label: "Email groupé envoyé",
    color: "bg-purple-50 text-purple-700",
  },
  MILESTONE_CREATED: {
    label: "Jalon ajouté",
    color: "bg-sky-50   text-sky-700",
  },
  APPLICATION_SUBMITTED: {
    label: "Candidature envoyée",
    color: "bg-blue-50  text-blue-700",
  },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action];
  if (!meta) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600">
        {action}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        meta.color,
      )}
    >
      {meta.label}
    </span>
  );
}

const ENTITY_ICONS: Record<string, { emoji: string; label: string }> = {
  project: { emoji: "📁", label: "Projet" },
  deliverable: { emoji: "📄", label: "Livrable" },
  user: { emoji: "👤", label: "Utilisateur" },
  application: { emoji: "📝", label: "Candidature" },
  milestone: { emoji: "🎯", label: "Jalon" },
};

export function AuditLogTable({ logs, loading }: AuditLogTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 animate-pulse"
          >
            <div className="h-8 w-8 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
            <div className="h-5 w-28 bg-slate-200 rounded-full" />
            <div className="h-3 w-32 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <FileText className="h-8 w-8 mb-2" />
        <p className="text-sm">Aucune entrée dans le journal</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log) => {
        // CORRECTION 5 : IIFE remplacée par une fonction utilitaire —
        // évite l'erreur "Expected an assignment or function call"
        let meta: unknown = null;
        if (log.metadata) {
          try {
            meta = JSON.parse(log.metadata) as unknown;
          } catch {
            meta = null;
          }
        }

        // CORRECTION 6 : role="img" → aria-label obligatoire
        const entityInfo = ENTITY_ICONS[log.entityType] ?? {
          emoji: "🔹",
          label: log.entityType,
        };
        const actorName = log.actor
          ? `${log.actor.firstName} ${log.actor.lastName}`
          : "Système";

        return (
          <div
            key={log.id}
            className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            {/* Icône entité — aria-label requis sur role="img" */}
            <span
              role="img"
              aria-label={entityInfo.label}
              className="text-lg mt-0.5 shrink-0"
            >
              {entityInfo.emoji}
            </span>

            {/* Corps */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <ActionBadge action={log.action} />
                <span className="text-xs text-slate-400">
                  entité :{" "}
                  <code className="font-mono text-slate-500">
                    {log.entityType}
                  </code>
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                <User2 className="h-3 w-3" />
                <span className="font-medium text-slate-600">{actorName}</span>
                {log.actor && (
                  <span className="text-slate-400">({log.actor.email})</span>
                )}
              </div>
              {meta !== null && (
                <p className="mt-0.5 text-xs text-slate-400 font-mono truncate">
                  {JSON.stringify(meta)}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="h-3 w-3" />
              {formatDate(log.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
