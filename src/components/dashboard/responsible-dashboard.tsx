"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  FolderOpen,
  FileText,
  TrendingUp,
  Video,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingSubjects } from "@/hooks/use-subjects";
import type { GlobalStats } from "@/types/reporting.types";

/* ─── Config statuts ─────────────────────────────────────────── */
const STATUS_LABELS: Record<string, string> = {
  PROPOSITION: "Propositions",
  EN_COURS: "En cours",
  SOUMIS: "Soumis",
  SOUTENU: "Soutenus",
  ARCHIVE: "Archivés",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "primary" | "warning" | "success" | "violet"
> = {
  PROPOSITION: "violet",
  EN_COURS: "primary",
  SOUMIS: "warning",
  SOUTENU: "success",
  ARCHIVE: "default",
};

/* Couleurs barre progression par statut */
const STATUS_BAR_COLORS: Record<string, string> = {
  PROPOSITION: "#7c3aed",
  EN_COURS: "#2563eb",
  SOUMIS: "#d97706",
  SOUTENU: "#1B8A5A",
  ARCHIVE: "#94a3b8",
};

const TYPE_DOTS: Record<string, string> = {
  PFE: "bg-blue-500",
  MEMOIRE: "bg-violet-500",
  THESE: "bg-amber-500",
};

const TYPE_BARS: Record<string, string> = {
  PFE: "#3b82f6",
  MEMOIRE: "#8b5cf6",
  THESE: "#f59e0b",
};

interface ResponsibleDashboardProps {
  stats: GlobalStats | null;
  loading: boolean;
}

export function ResponsibleDashboard({
  stats,
  loading,
}: ResponsibleDashboardProps) {
  const { pendingSubjects, loading: pendingLoading } = usePendingSubjects();
  const pendingCount = pendingSubjects.length;

  if (loading) return <ResponsibleDashboardSkeleton />;
  if (!stats) return null;

  const { overview, byStatus, byType, deliverables } = stats;
  const totalProjects = overview.totalProjects;

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── Alerte sujets en attente — style OripioFin ── */}
      {!pendingLoading && pendingCount > 0 && (
        <Link href="/subjects/pending">
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              boxShadow: "0 4px 12px -2px rgb(245 158 11/0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#fef3c7", border: "1px solid #fde68a" }}
              >
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 tracking-[-0.02em]">
                  {pendingCount} sujet{pendingCount > 1 ? "s" : ""} en attente
                  de validation
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Cliquez pour traiter les propositions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="inline-flex items-center justify-center h-6 min-w-6 rounded-full px-1.5 text-xs font-bold text-amber-700"
                style={{ background: "#fde68a" }}
              >
                {pendingCount}
              </span>
              <ArrowRight className="h-4 w-4 text-amber-500" />
            </div>
          </div>
        </Link>
      )}

      {/* ── KPIs style OripioFin ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Projets"
          value={overview.totalProjects}
          icon={<FolderOpen className="h-4.5 w-4.5" />}
          variant="primary"
        />
        <StatCard
          title="Étudiants"
          value={overview.totalStudents}
          icon={<Users className="h-4.5 w-4.5" />}
        />
        <StatCard
          title="Encadrants"
          value={overview.totalTeachers}
          icon={<Shield className="h-4.5 w-4.5" />}
          variant="violet"
        />
        <StatCard
          title="Livrables"
          value={overview.totalDeliveries}
          icon={<FileText className="h-4.5 w-4.5" />}
          variant="amber"
        />
        <StatCard
          title="Sessions"
          value={overview.totalSessions}
          icon={<Video className="h-4.5 w-4.5" />}
        />
        <StatCard
          title="Taux validation"
          value={`${overview.validationRate}%`}
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          variant={
            overview.validationRate >= 80
              ? "primary"
              : overview.validationRate >= 50
                ? "amber"
                : "red"
          }
        />
      </div>

      {/* ── Grille analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets par statut */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FolderOpen className="h-3.5 w-3.5 text-primary-600" />
                </div>
                Projets par statut
              </CardTitle>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Gérer <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {byStatus.map((item) => (
              <div key={item.status} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={STATUS_VARIANTS[item.status] ?? "default"}
                    dot
                  >
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                  <span className="text-sm font-bold text-slate-700">
                    {item.count}
                  </span>
                </div>
                {/* Barre progression avec couleur par statut */}
                <div
                  className="h-2 w-full rounded-full overflow-hidden"
                  style={{ background: "#EEF0F3" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(totalProjects, 1) > 0 ? (item.count / Math.max(totalProjects, 1)) * 100 : 0}%`,
                      background: STATUS_BAR_COLORS[item.status] ?? "#94a3b8",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projets par type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
              </div>
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {byType.map((item) => {
              const pct =
                totalProjects > 0
                  ? Math.round((item.count / totalProjects) * 100)
                  : 0;
              return (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${TYPE_DOTS[item.type] ?? "bg-slate-400"}`}
                      />
                      <span className="text-sm font-medium text-slate-700 tracking-[-0.01em]">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {item.count}
                      </span>
                      <span className="text-xs text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{ background: "#EEF0F3" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 progress-fill"
                      style={
                        {
                          "--p-width": `${pct}%`,
                          background: TYPE_BARS[item.type] ?? "#94a3b8",
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* État des livrables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-amber-600" />
              </div>
              État des livrables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              {
                status: "APPROVED",
                label: "Approuvés",
                icon: <CheckCircle2 className="h-4 w-4 text-primary-600" />,
                bg: "#edfaf4",
                border: "#a8e9cb",
              },
              {
                status: "PENDING",
                label: "En attente",
                icon: <Clock className="h-4 w-4 text-amber-500" />,
                bg: "#fffbeb",
                border: "#fde68a",
              },
              {
                status: "REVISION_REQUESTED",
                label: "Révision demandée",
                icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
                bg: "#fff1f2",
                border: "#fecaca",
              },
            ].map((item) => {
              const found = deliverables.find((d) => d.status === item.status);
              return (
                <div
                  key={item.status}
                  className="flex items-center justify-between p-3.5 rounded-xl"
                  style={{
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-sm font-medium text-slate-700 tracking-[-0.01em]">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {found?.count ?? 0}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Accès rapide style OripioFin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-slate-600" />
              </div>
              Accès rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                href: "/subjects/pending",
                icon: <BookOpen className="h-4 w-4" />,
                label: "Valider les sujets",
                desc: `${pendingCount} sujet${pendingCount > 1 ? "s" : ""} en attente`,
                highlight: pendingCount > 0,
              },
              {
                href: "/projects",
                icon: <FolderOpen className="h-4 w-4" />,
                label: "Gérer les projets",
                desc: "Propositions & validations",
                highlight: false,
              },
              {
                href: "/defense",
                icon: <Shield className="h-4 w-4" />,
                label: "Planifier les soutenances",
                desc: "Affectation jurys & dates",
                highlight: false,
              },
              {
                href: "/reports",
                icon: <TrendingUp className="h-4 w-4" />,
                label: "Rapports & exports",
                desc: "PDF & Excel",
                highlight: false,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:-translate-y-0.5 group"
                style={
                  item.highlight
                    ? { background: "#fffbeb", border: "1px solid #fde68a" }
                    : { background: "#FFFFFF", border: "1px solid #E8ECF0" }
                }
                onMouseEnter={(e) => {
                  if (!item.highlight) {
                    e.currentTarget.style.borderColor = "#a8e9cb";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px -2px rgb(27 138 90/0.10)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.highlight) {
                    e.currentTarget.style.borderColor = "#E8ECF0";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={
                    item.highlight
                      ? { background: "#fef3c7", color: "#b45309" }
                      : { background: "#F6F8FA", color: "#6E7A8A" }
                  }
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 tracking-[-0.01em]">
                    {item.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${item.highlight ? "text-amber-600 font-medium" : "text-slate-400"}`}
                  >
                    {item.desc}
                  </p>
                </div>
                <ArrowRight
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    item.highlight
                      ? "text-amber-400"
                      : "text-slate-300 group-hover:text-primary-400"
                  }`}
                />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function ResponsibleDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-4"
          >
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-6" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
