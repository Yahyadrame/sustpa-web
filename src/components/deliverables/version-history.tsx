"use client";

import { CheckCircle2, Clock, RotateCcw, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Deliverable } from "@/types/deliverable.types";

/* ── Config statuts ─────────────────────────────────────────── */
const STATUS_CFG = {
  PENDING: {
    icon: <Clock className="h-3.5 w-3.5" />,
    dot: "#fde68a",
    text: "#b45309",
  },
  APPROVED: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    dot: "#a8e9cb",
    text: "#1B8A5A",
  },
  REVISION_REQUESTED: {
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    dot: "#fecaca",
    text: "#dc2626",
  },
};

interface VersionHistoryProps {
  versions: Deliverable[];
  currentId: string;
}

export function VersionHistory({ versions, currentId }: VersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <div className="space-y-0">
      {versions.map((v, i) => {
        const isCurrent = v.id === currentId;
        const isLast = i === versions.length - 1;
        /* streamUrl NestJS — logique inchangée */
        const streamUrl = `/api/v1/deliverables/${v.id}/stream`;
        const sCfg = STATUS_CFG[v.status] ?? STATUS_CFG.PENDING;

        return (
          <div key={v.id} className="relative flex gap-3 pb-4">
            {/* Ligne verticale */}
            {!isLast && (
              <div
                className="absolute top-7 bottom-0 w-0.5"
                style={{ left: "11px", background: "#E8ECF0" }}
              />
            )}

            {/* Indicateur version */}
            <div
              className="relative z-10 mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all"
              style={{
                background: isCurrent ? "#edfaf4" : "#FFFFFF",
                border: `2px solid ${isCurrent ? "#1B8A5A" : sCfg.dot}`,
              }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: isCurrent ? "#1B8A5A" : sCfg.text }}
              />
            </div>

            {/* Contenu */}
            <div
              className="flex-1 pb-0 min-w-0"
              style={{ opacity: isCurrent ? 1 : 0.65 }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Badge version */}
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md tracking-[-0.01em]"
                    style={
                      isCurrent
                        ? { background: "#edfaf4", color: "#1B8A5A" }
                        : { background: "#F6F8FA", color: "#64748b" }
                    }
                  >
                    v{v.version}
                  </span>

                  {/* Icône statut */}
                  <span style={{ color: sCfg.text }}>{sCfg.icon}</span>

                  {isCurrent && (
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#1B8A5A" }}
                    >
                      Actuelle
                    </span>
                  )}
                </div>

                {/* Télécharger — streamUrl NestJS, pas Cloudinary */}
                <a
                  href={streamUrl}
                  download={`${v.title}_v${v.version}`}
                  aria-label={`Télécharger la version v${v.version}`}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors p-1 rounded-lg hover:bg-primary-50"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>

              <p className="text-xs font-medium text-slate-700 mt-1 truncate tracking-[-0.01em]">
                {v.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDate(v.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
