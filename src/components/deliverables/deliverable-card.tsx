"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  RotateCcw,
  Download,
  Eye,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Deliverable } from "@/types/deliverable.types";

/* ── Config statuts ─────────────────────────────────────────── */
const STATUS_CFG = {
  PENDING: {
    label: "En attente",
    icon: <Clock className="h-3.5 w-3.5" />,
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#b45309",
    cardBg: "#fffdf4",
  },
  APPROVED: {
    label: "Approuvé",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "#edfaf4",
    border: "#a8e9cb",
    text: "#1B8A5A",
    cardBg: "#f8fdfb",
  },
  REVISION_REQUESTED: {
    label: "Révision demandée",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    bg: "#fff1f2",
    border: "#fecaca",
    text: "#dc2626",
    cardBg: "#fffafb",
  },
};

const MIME_ICON: Record<string, string> = {
  "application/pdf": "📄",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝",
  "application/zip": "📦",
  "application/x-zip-compressed": "📦",
};

function MimeIcon({ mimeType }: { mimeType: string }) {
  const isDoc =
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (isDoc) return <FileText className="h-5 w-5 text-blue-500" />;
  return <span className="text-xl">{MIME_ICON[mimeType] ?? "📎"}</span>;
}

function formatBytes(bytes: number): string {
  if (isNaN(bytes)) return "0 Ko";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface DeliverableCardProps {
  deliverable: Deliverable;
  onApprove?: (id: string) => void;
  onRequestRevision?: (id: string) => void;
  canReview?: boolean;
  className?: string;
}

export function DeliverableCard({
  deliverable,
  onApprove,
  onRequestRevision,
  canReview = false,
  className,
}: DeliverableCardProps) {
  const cfg = STATUS_CFG[deliverable.status];
  const streamUrl = `/api/v1/deliverables/${deliverable.id}/stream`;

  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${className ?? ""}`}
      style={{
        background: cfg.cardBg,
        border: `1px solid ${cfg.border}`,
        boxShadow: "0 0 0 1px rgb(0 0 0/0.02), 0 2px 6px 0 rgb(0 0 0/0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icône fichier */}
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "#FFFFFF",
              border: `1px solid ${cfg.border}`,
              boxShadow: "0 1px 4px rgb(0 0 0/0.06)",
            }}
          >
            <MimeIcon mimeType={deliverable.mimeType} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight tracking-[-0.02em]">
              {deliverable.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs text-slate-400">
                v{deliverable.version}
              </span>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-xs text-slate-400">
                {formatBytes(deliverable.fileSize)}
              </span>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-xs text-slate-400">
                {formatDate(deliverable.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Badge statut */}
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
          style={{
            background: cfg.bg,
            color: cfg.text,
            border: `1px solid ${cfg.border}`,
          }}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1.5 pt-3 flex-wrap"
        style={{ borderTop: `1px solid ${cfg.border}` }}
      >
        <Link
          href={`/deliverables/${deliverable.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors text-slate-600 hover:text-primary-700 whitespace-nowrap"
          style={{ background: "#FFFFFF66" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FFFFFF66";
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Détails
        </Link>

        <a
          href={streamUrl}
          download={deliverable.title}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors text-slate-600 hover:text-primary-700 whitespace-nowrap"
          style={{ background: "#FFFFFF66" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FFFFFF66";
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Télécharger
        </a>

        {/* Approuver / Réviser — canReview TEACHER/RESPONSIBLE */}
        {canReview && deliverable.status === "PENDING" && (
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onApprove?.(deliverable.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white transition-all hover:shadow-sm active:scale-[0.97] whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #1B8A5A, #156e48)",
              }}
            >
              <CheckCircle2 className="h-3 w-3" />
              Approuver
            </button>
            <button
              type="button"
              onClick={() => onRequestRevision?.(deliverable.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white transition-all hover:shadow-sm active:scale-[0.97] whitespace-nowrap"
              style={{ background: "#d97706" }}
            >
              <RotateCcw className="h-3 w-3" />
              Révision
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
