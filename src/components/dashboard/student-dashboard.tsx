"use client";

import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Upload,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge, ProjectStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { StudentStats } from "@/types/reporting.types";

interface StudentDashboardProps {
  stats: StudentStats | null;
  loading: boolean;
  name: string;
}

export function StudentDashboard({ stats, loading }: StudentDashboardProps) {
  if (loading) return <StudentDashboardSkeleton />;
  if (!stats) return null;

  const { milestoneProgress, deliverablesByStatus } = stats;
  const milestonePercent =
    milestoneProgress.total > 0
      ? Math.round(
          (milestoneProgress.completed / milestoneProgress.total) * 100,
        )
      : 0;

  const activeProject = stats.activeProject as {
    id: string;
    title: string;
    type: string;
    status: string;
  } | null;

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mes projets"
          value={stats.totalProjects}
          icon={<FolderOpen className="h-4.5 w-4.5" />}
          variant="primary"
        />
        <StatCard
          title="Livrables déposés"
          value={stats.totalDeliverables}
          icon={<Upload className="h-4.5 w-4.5" />}
        />
        <StatCard
          title="Approuvés"
          value={deliverablesByStatus.APPROVED}
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          variant="amber"
        />
        <StatCard
          title="En attente"
          value={deliverablesByStatus.PENDING}
          icon={<Clock className="h-4.5 w-4.5" />}
          variant="red"
        />
      </div>

      {/* ── Grille principale ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projet actif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-primary-600" />
              </div>
              Projet actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activeProject ? (
              <EmptyState
                icon={<FolderOpen className="h-6 w-6" />}
                title="Aucun projet actif"
                description="Proposez un sujet ou postulez à un sujet disponible dans la bibliothèque."
                size="sm"
                action={
                  <Link href="/subjects/new">
                    <button
                      className="inline-flex items-center gap-1.5 text-xs font-medium rounded-xl px-4 py-2.5 text-white"
                      style={{
                        background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                        boxShadow: "0 4px 12px -2px rgb(27 138 90/0.30)",
                      }}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Proposer un sujet
                    </button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Header projet */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate tracking-[-0.02em]">
                      {activeProject.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="violet">{activeProject.type}</Badge>
                      <ProjectStatusBadge status={activeProject.status} />
                    </div>
                  </div>
                  <Link
                    href={`/projects/${activeProject.id}`}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Voir <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Progression jalons */}
                {milestoneProgress.total > 0 && (
                  <div
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: "#F6F8FA",
                      border: "1px solid #E8ECF0",
                    }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Progression jalons
                      </span>
                      <span className="font-bold text-slate-700">
                        {milestoneProgress.completed}/{milestoneProgress.total}
                      </span>
                    </div>
                    <Progress
                      value={milestonePercent}
                      size="md"
                      showValue
                      variant={
                        milestonePercent >= 80
                          ? "success"
                          : milestonePercent >= 40
                            ? "primary"
                            : "warning"
                      }
                    />
                    {milestoneProgress.overdue > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {milestoneProgress.overdue} jalon
                        {milestoneProgress.overdue > 1 ? "s" : ""} en retard
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions Meet à venir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
              </div>
              Sessions à venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingSessions.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-6 w-6" />}
                title="Aucune session planifiée"
                size="sm"
              />
            ) : (
              <div className="space-y-2.5">
                {(
                  stats.upcomingSessions as {
                    id: string;
                    title: string;
                    scheduledAt: string;
                    isConfirmed: boolean;
                  }[]
                ).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{
                      background: "#F6F8FA",
                      border: "1px solid #E8ECF0",
                    }}
                  >
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate tracking-[-0.01em]">
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(s.scheduledAt).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant={s.isConfirmed ? "success" : "warning"} dot>
                      {s.isConfirmed ? "Confirmé" : "En attente"}
                    </Badge>
                  </div>
                ))}
                <Link
                  href="/meet"
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 pt-2 transition-colors"
                >
                  Voir toutes les sessions
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Livrables récents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                </div>
                Livrables récents
              </CardTitle>
              <Link
                href="/deliverables"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentDeliverables.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="Aucun livrable"
                description="Déposez votre premier livrable sur un jalon actif."
                size="sm"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(
                  stats.recentDeliverables as {
                    id: string;
                    title: string;
                    version: number;
                    status: string;
                    createdAt: string;
                  }[]
                ).map((d) => (
                  <Link
                    key={d.id}
                    href={`/deliverables/${d.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{
                      border: "1px solid #E8ECF0",
                      boxShadow: "0 0 0 1px rgb(0 0 0/0.02)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#a8e9cb";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px -2px rgb(27 138 90/0.10)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E8ECF0";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 1px rgb(0 0 0/0.02)";
                    }}
                  >
                    {/* Icône document */}
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{
                        background: "#F6F8FA",
                        border: "1px solid #E8ECF0",
                      }}
                    >
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate tracking-[-0.01em]">
                        {d.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        v{d.version} · {formatDate(d.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        d.status === "APPROVED"
                          ? "success"
                          : d.status === "REVISION_REQUESTED"
                            ? "danger"
                            : "warning"
                      }
                      dot
                    >
                      {d.status === "APPROVED"
                        ? "Approuvé"
                        : d.status === "REVISION_REQUESTED"
                          ? "Révision"
                          : "En attente"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-14" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-4"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
