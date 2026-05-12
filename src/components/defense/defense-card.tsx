"use client";

import Link from "next/link";
import { Calendar, MapPin, Star, Users, ExternalLink, Shield, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Defense }  from "@/types/defense.types";
import type { AppRole }  from "@/types/auth.types";

interface DefenseCardProps {
  defense:       Defense;
  userRole:      AppRole;
  onGrade?:      (id: string) => void;
  onAssignJury?: (id: string) => void;
  className?:    string;
}

function getMentionLabel(grade: number | null): string {
  if (!grade) return "—";
  if (grade >= 16) return "Très Bien";
  if (grade >= 14) return "Bien";
  if (grade >= 12) return "Assez Bien";
  if (grade >= 10) return "Passable";
  return "Insuffisant";
}

function getMentionStyle(grade: number | null): { color: string } {
  if (!grade)      return { color: "#94a3b8" };
  if (grade >= 14) return { color: "#1B8A5A" };
  if (grade >= 10) return { color: "#2563eb" };
  return             { color: "#dc2626" };
}

export function DefenseCard({ defense, userRole, onGrade, onAssignJury, className }: DefenseCardProps) {
  const upcoming = new Date(defense.scheduledAt) > new Date();
  const isHead   = ["RESPONSIBLE", "ADMIN"].includes(userRole);
  const isJury   = userRole === "JURY_MEMBER";
  const hasGrade = !!defense.finalGrade;

  return (
    <div
      className={`flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${className ?? ""}`}
      style={{
        background: hasGrade ? "#f8fdfb" : upcoming ? "#f8faff" : "#FFFFFF",
        border:     hasGrade ? "1px solid #a8e9cb" : upcoming ? "1px solid #bfdbfe" : "1px solid #E8ECF0",
        boxShadow:  "0 0 0 1px rgb(0 0 0/0.02), 0 2px 6px 0 rgb(0 0 0/0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 tracking-[-0.02em]">
            {(defense.project as { title: string } | undefined)?.title || "Projet sans titre"}
          </p>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold mt-1"
            style={
              hasGrade  ? { background: "#edfaf4", color: "#1B8A5A", border: "1px solid #a8e9cb" } :
              upcoming  ? { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" } :
                          { background: "#F6F8FA", color: "#64748b", border: "1px solid #E8ECF0" }
            }
          >
            <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: hasGrade ? "#1B8A5A" : upcoming ? "#d97706" : "#94a3b8" }} />
            {hasGrade ? "Notée" : upcoming ? "Planifiée" : "Passée"}
          </span>
        </div>

        {hasGrade && (
          <div className="text-right shrink-0">
            <p className="text-2xl font-black tracking-[-0.04em]" style={getMentionStyle(defense.finalGrade)}>
              {defense.finalGrade}/20
            </p>
            <p className="text-xs font-semibold" style={getMentionStyle(defense.finalGrade)}>
              {getMentionLabel(defense.finalGrade)}
            </p>
          </div>
        )}
      </div>

      {/* Infos grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <Calendar className="h-3.5 w-3.5" />, label: "Date",  value: formatDate(defense.scheduledAt) },
          { icon: <Clock    className="h-3.5 w-3.5" />, label: "Heure", value: new Date(defense.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
          { icon: <MapPin   className="h-3.5 w-3.5" />, label: "Salle", value: defense.room ?? "À définir" },
          { icon: <Users    className="h-3.5 w-3.5" />, label: "Jury",  value: `${defense.jury?.length ?? 0} membre${(defense.jury?.length ?? 0) > 1 ? "s" : ""}` },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 p-2.5 rounded-xl"
            style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
          >
            <span className="text-slate-400 shrink-0 mt-0.5">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400">{item.label}</p>
              <p className="text-xs font-medium text-slate-700 truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Remarques */}
      {defense.remarks && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: "#FFFFFF", border: "1px solid #E8ECF0" }}>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">Remarques</p>
          <p className="text-sm text-slate-600 line-clamp-2">{defense.remarks}</p>
        </div>
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-2 pt-3 flex-wrap"
        style={{ borderTop: `1px solid ${hasGrade ? "#a8e9cb" : upcoming ? "#bfdbfe" : "#E8ECF0"}` }}
      >
        <Link
          href={`/defense/${defense.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />Détails
        </Link>

        {isHead && !defense.jury?.length && (
          <button
            onClick={() => onAssignJury?.(defense.id)}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
            style={{ background: "linear-gradient(135deg, #1B8A5A, #156e48)" }}
          >
            <Shield className="h-3.5 w-3.5" />Affecter le jury
          </button>
        )}

        {(isJury || isHead) && !hasGrade && !upcoming && (
          <button
            onClick={() => onGrade?.(defense.id)}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-all hover:shadow-sm"
            style={{ background: "#d97706" }}
          >
            <Star className="h-3.5 w-3.5" />
            {isHead ? "Saisir note finale" : "Soumettre ma note"}
          </button>
        )}
      </div>
    </div>
  );
}