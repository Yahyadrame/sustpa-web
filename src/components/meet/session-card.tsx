"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetSession } from "@/types/meet.types";
import type { AppRole } from "@/types/auth.types";

interface SessionCardProps {
  session: MeetSession;
  userRole: AppRole;
  onConfirm?: (id: string) => void;
  onReport?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

/* formatDuration — logique inchangée */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${h}h${rem}min` : `${h}h`;
}

export function SessionCard({
  session,
  userRole,
  onConfirm,
  onReport,
  onDelete,
  className,
}: SessionCardProps) {
  const upcoming = isUpcoming(session.scheduledAt);
  const hasReport = !!session.report;
  const isTeacher = ["TEACHER", "RESPONSIBLE"].includes(userRole);
  const isStudent = userRole === "STUDENT";

  /* Couleurs carte par état */
  const cardStyle = hasReport
    ? { background: "#f8fdfb", border: "1px solid #a8e9cb" }
    : upcoming
      ? { background: "#f8faff", border: "1px solid #bfdbfe" }
      : { background: "#FFFFFF", border: "1px solid #E8ECF0", opacity: 0.85 };

  const footerBorder = hasReport ? "#a8e9cb" : upcoming ? "#bfdbfe" : "#E8ECF0";

  /* Badge statut */
  const badgeCfg = hasReport
    ? { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb", label: "Archivée" }
    : session.isConfirmed
      ? {
          bg: "#edfaf4",
          text: "#1B8A5A",
          border: "#a8e9cb",
          label: "Confirmée",
        }
      : upcoming
        ? {
            bg: "#fffbeb",
            text: "#b45309",
            border: "#fde68a",
            label: "Planifiée",
          }
        : {
            bg: "#F6F8FA",
            text: "#64748b",
            border: "#E8ECF0",
            label: "Passée",
          };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5",
        className,
      )}
      style={{
        ...cardStyle,
        boxShadow: "0 0 0 1px rgb(0 0 0/0.02), 0 2px 6px 0 rgb(0 0 0/0.04)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800 leading-snug tracking-[-0.02em]">
              {session.title}
            </h3>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold shrink-0"
              style={{
                background: badgeCfg.bg,
                color: badgeCfg.text,
                border: `1px solid ${badgeCfg.border}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full inline-block"
                style={{ background: badgeCfg.text }}
              />
              {badgeCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {new Date(session.scheduledAt).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {new Date(session.scheduledAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" — "}
              {formatDuration(session.durationMin)}
            </span>
          </div>
        </div>

        {/* Rejoindre */}
        {upcoming && (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-xl transition-all hover:shadow-sm active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #1B8A5A, #156e48)",
              boxShadow: "0 2px 8px -2px rgb(27 138 90/0.25)",
            }}
          >
            <Video className="h-3.5 w-3.5" />
            Rejoindre
          </a>
        )}
      </div>

      {/* ── Ordre du jour ── */}
      {session.agenda && (
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
        >
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
            Ordre du jour
          </p>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
            {session.agenda}
          </p>
        </div>
      )}

      {/* ── Compte-rendu ── */}
      {hasReport && (
        <div
          className="rounded-xl px-4 py-3 relative overflow-hidden"
          style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary-600" />
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1 ml-2 flex items-center gap-1.5"
            style={{ color: "#1B8A5A" }}
          >
            <FileText className="h-3.5 w-3.5" />
            Compte-rendu
          </p>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4 ml-2">
            {session.report}
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div
        className="flex items-center gap-2 pt-3 flex-wrap"
        style={{ borderTop: `1px solid ${footerBorder}` }}
      >
        {/* Étudiant : confirmer */}
        {isStudent && !session.isConfirmed && upcoming && (
          <button
            onClick={() => onConfirm?.(session.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
            style={{ background: "linear-gradient(135deg, #1B8A5A, #156e48)" }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirmer ma disponibilité
          </button>
        )}

        {/* Enseignant : saisir CR */}
        {isTeacher && !hasReport && !upcoming && (
          <button
            onClick={() => onReport?.(session.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "#F6F8FA",
              color: "#475569",
              border: "1px solid #E8ECF0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E8ECF0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F6F8FA";
            }}
          >
            <FileText className="h-3.5 w-3.5" />
            Saisir le compte-rendu
          </button>
        )}

        {/* Détails */}
        <Link
          href={`/meet/${session.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-600 transition-colors ml-auto"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Détails
        </Link>

        {/* Supprimer */}
        {isTeacher && upcoming && (
          <button
            onClick={() => onDelete?.(session.id)}
            aria-label="Supprimer la session"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
