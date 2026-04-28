"use client";

import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Video,
  Clock,
  CheckCircle2,
  ArrowRight,
  Users,
  LayoutGrid,
} from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, ProjectStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeacherStats } from "@/types/reporting.types";

interface TeacherDashboardProps {
  stats: TeacherStats | null;
  loading: boolean;
}

export function TeacherDashboard({ stats, loading }: TeacherDashboardProps) {
  if (loading) return <TeacherDashboardSkeleton />;
  if (!stats) return null;

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
          title="En cours"
          value={stats.projectsByStatus.EN_COURS}
          icon={<Clock className="h-4.5 w-4.5" />}
        />
        <StatCard
          title="Livrables en attente"
          value={stats.pendingDeliverables}
          icon={<FileText className="h-4.5 w-4.5" />}
          variant="amber"
        />
        <StatCard
          title="Sessions Meet"
          value={stats.totalSessions}
          icon={<Video className="h-4.5 w-4.5" />}
          variant="violet"
        />
      </div>

      {/* ── Grille ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition statuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                <LayoutGrid className="h-3.5 w-3.5 text-primary-600" />
              </div>
              Répartition projets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              {
                label: "En cours",
                value: stats.projectsByStatus.EN_COURS,
                variant: "en_cours" as const,
              },
              {
                label: "Soumis",
                value: stats.projectsByStatus.SOUMIS,
                variant: "soumis" as const,
              },
              {
                label: "Soutenus",
                value: stats.projectsByStatus.SOUTENU,
                variant: "soutenu" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl transition-colors"
                style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
              >
                <span className="text-sm text-slate-600 tracking-[-0.01em]">
                  {item.label}
                </span>
                <Badge variant={item.variant} dot>
                  {item.value}
                </Badge>
              </div>
            ))}

            {/* Total encadré */}
            <div
              className="flex items-center justify-between p-3 rounded-xl mt-1"
              style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                <CheckCircle2 className="h-4 w-4 text-primary-600" />
                Total encadré
              </span>
              <span className="text-sm font-bold text-primary-700">
                {stats.totalProjects}
              </span>
            </div>

            {/* Lien utilisateurs */}
            <Link
              href="/projects"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors pt-1"
            >
              <Users className="h-3.5 w-3.5" />
              Voir tous mes projets
            </Link>
          </CardContent>
        </Card>

        {/* Projets récents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FolderOpen className="h-3.5 w-3.5 text-slate-600" />
                </div>
                Projets récents
              </CardTitle>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentProjects.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="h-6 w-6" />}
                title="Aucun projet"
                size="sm"
              />
            ) : (
              <div className="space-y-2">
                {(
                  stats.recentProjects as {
                    id: string;
                    title: string;
                    type: string;
                    status: string;
                  }[]
                ).map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:-translate-y-0.5 group"
                    style={{ border: "1px solid #E8ECF0" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#a8e9cb";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px -2px rgb(27 138 90/0.10)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E8ECF0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Icône */}
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        background: "#edfaf4",
                        border: "1px solid #a8e9cb",
                      }}
                    >
                      <FolderOpen className="h-4 w-4 text-primary-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate tracking-[-0.02em]">
                        {p.title}
                      </p>
                      <Badge variant="violet" size="sm" className="mt-1">
                        {p.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ProjectStatusBadge status={p.status} />
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary-400 transition-colors" />
                    </div>
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
function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-[#E8ECF0] bg-white p-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
