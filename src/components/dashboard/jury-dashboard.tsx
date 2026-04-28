"use client";

import Link from "next/link";
import {
  Shield,
  Calendar,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  FileText,
  Eye,
  GraduationCap,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useDefense } from "@/hooks/use-defense";
import type { Defense } from "@/types/defense.types";

/* ─── Helpers mention — logique inchangée ────────────────────── */
function getMentionLabel(grade: number | null): string {
  if (grade === null) return "—";
  if (grade >= 16) return "Très Bien";
  if (grade >= 14) return "Bien";
  if (grade >= 12) return "Assez Bien";
  if (grade >= 10) return "Passable";
  return "Insuffisant";
}

function getMentionColor(grade: number | null): string {
  if (grade === null) return "#94a3b8";
  if (grade >= 14) return "#1B8A5A";
  if (grade >= 10) return "#2563eb";
  return "#dc2626";
}

interface JuryDashboardProps {
  name: string;
}

export function JuryDashboard({ name }: JuryDashboardProps) {
  const { defenses, loading } = useDefense();

  if (loading) return <JuryDashboardSkeleton />;

  /* Filtres — logique inchangée */
  const upcoming = defenses.filter((d) => new Date(d.scheduledAt) > new Date());
  const graded = defenses.filter((d) => d.finalGrade !== null);
  const pending = defenses.filter(
    (d) => d.finalGrade === null && new Date(d.scheduledAt) <= new Date(),
  );

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── Bannière membre du jury style OripioFin ── */}
      <div
        className="rounded-2xl p-6 flex items-start justify-between gap-4"
        style={{
          background:
            "linear-gradient(135deg, #1B8A5A 0%, #156e48 60%, #0e4530 100%)",
          boxShadow: "0 8px 24px -4px rgb(27 138 90/0.35)",
        }}
      >
        <div className="space-y-1.5">
          <p
            className="text-xs font-semibold uppercase tracking-[0.08em]"
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            Membre du jury
          </p>
          <h2 className="text-xl font-bold text-white tracking-[-0.03em]">
            Bonjour, {name} 👋
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Vous avez{" "}
            <span className="font-bold text-white">
              {defenses.length} soutenance{defenses.length > 1 ? "s" : ""}
            </span>{" "}
            assignée{defenses.length > 1 ? "s" : ""}.
          </p>
        </div>
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total assignées"
          value={defenses.length}
          icon={<Shield className="h-4.5 w-4.5" />}
        />
        <StatCard
          title="À venir"
          value={upcoming.length}
          icon={<Calendar className="h-4.5 w-4.5" />}
          variant="primary"
        />
        <StatCard
          title="En attente de note"
          value={pending.length}
          icon={<Clock className="h-4.5 w-4.5" />}
          variant="amber"
        />
        <StatCard
          title="Notées"
          value={graded.length}
          icon={<Star className="h-4.5 w-4.5" />}
          variant="violet"
        />
      </div>

      {/* ── Grille ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soutenances à venir */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                </div>
                À venir
              </CardTitle>
              <Link
                href="/defense"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-6 w-6" />}
                title="Aucune soutenance à venir"
                size="sm"
              />
            ) : (
              <div className="space-y-2.5">
                {upcoming.slice(0, 4).map((d) => (
                  <UpcomingDefenseItem key={d.id} defense={d} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* En attente de notation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Star className="h-3.5 w-3.5 text-amber-600" />
                </div>
                En attente de notation
              </CardTitle>
              {pending.length > 0 && (
                <Badge variant="warning" dot>
                  {pending.length} à noter
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <EmptyState
                icon={<Star className="h-6 w-6" />}
                title="Aucune notation en attente"
                description="Toutes les soutenances passées ont été notées."
                size="sm"
              />
            ) : (
              <div className="space-y-2.5">
                {pending.slice(0, 4).map((d) => (
                  <PendingGradeItem key={d.id} defense={d} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historique — pleine largeur */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary-600" />
                </div>
                Soutenances notées
              </CardTitle>
              <span className="text-xs text-slate-400">
                {graded.length} au total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {graded.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="Aucune soutenance notée"
                description="Les notes que vous avez soumises apparaîtront ici."
                size="sm"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {graded.map((d) => (
                  <GradedDefenseItem key={d.id} defense={d} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Sous-composants — logique inchangée ────────────────────── */

function UpcomingDefenseItem({ defense }: { defense: Defense }) {
  const project = defense.project as
    | { title: string; type: string }
    | undefined;

  return (
    <Link
      href={`/defense/${defense.id}`}
      className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:-translate-y-0.5 group"
      style={{ border: "1px solid #E8ECF0" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#bfdbfe";
        e.currentTarget.style.boxShadow = "0 4px 12px -2px rgb(37 99 235/0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E8ECF0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
      >
        <Calendar className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate tracking-[-0.02em]">
          {project?.title ?? "Projet"}
        </p>
        <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            {new Date(defense.scheduledAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {new Date(defense.scheduledAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {defense.room && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              {defense.room}
            </span>
          )}
        </div>
      </div>
      <Badge variant="warning" dot className="shrink-0">
        Planifiée
      </Badge>
    </Link>
  );
}

function PendingGradeItem({ defense }: { defense: Defense }) {
  const project = defense.project as { title: string } | undefined;

  return (
    <Link
      href={`/defense/${defense.id}`}
      className="flex items-center gap-3 p-3.5 rounded-xl transition-all hover:-translate-y-0.5 group"
      style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "#fef3c7" }}
      >
        <Star className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate tracking-[-0.02em]">
          {project?.title ?? "Projet"}
        </p>
        <p className="text-xs text-amber-600 mt-0.5 font-medium">
          Note en attente
        </p>
      </div>
      <span
        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
        style={{ background: "#fde68a", color: "#92400e" }}
      >
        <Star className="h-3 w-3" />
        Noter
      </span>
    </Link>
  );
}

function GradedDefenseItem({ defense }: { defense: Defense }) {
  const project = defense.project as
    | { title: string; type: string }
    | undefined;

  return (
    <Link
      href={`/defense/${defense.id}`}
      className="flex items-center gap-3 p-3.5 rounded-xl transition-all hover:-translate-y-0.5"
      style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
    >
      {/* Note */}
      <div
        className="h-10 w-10 rounded-xl flex flex-col items-center justify-center shrink-0"
        style={{ background: "#d2f4e4" }}
      >
        <span className="text-xs font-black text-primary-700 leading-none">
          {defense.finalGrade}
        </span>
        <span className="text-[9px] text-primary-500 leading-none mt-0.5">
          /20
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate tracking-[-0.02em]">
          {project?.title ?? "Projet"}
        </p>
        <p
          className="text-xs font-semibold mt-0.5"
          style={{ color: getMentionColor(defense.finalGrade) }}
        >
          {getMentionLabel(defense.finalGrade)}
        </p>
      </div>
      <Eye className="h-4 w-4 text-primary-400 shrink-0" />
    </Link>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function JuryDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3"
          >
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
