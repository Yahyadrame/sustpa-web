"use client";

import { useId } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Shield,
  ClipboardList,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { useAdminStats } from "@/hooks/use-admin";
import { useAuthStore } from "@/store/auth.store";
import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

// ✅ CORRIGÉ — libellé lisible pour RESPONSIBLE
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  STUDENT: "Étudiant",
  TEACHER: "Enseignant",
  RESPONSIBLE: "Resp. filière",
  JURY_MEMBER: "Jury",
};

const ROLE_VARIANTS: Record<
  string,
  "default" | "primary" | "accent" | "warning" | "danger"
> = {
  ADMIN: "danger",
  STUDENT: "primary",
  TEACHER: "accent",
  RESPONSIBLE: "warning",
  JURY_MEMBER: "default",
};

const STATUS_LABELS: Record<string, string> = {
  PROPOSITION: "Propositions",
  EN_COURS: "En cours",
  SOUMIS: "Soumis",
  SOUTENU: "Soutenus",
  ARCHIVE: "Archivés",
};

const STATUS_COLORS: Record<string, string> = {
  PROPOSITION: "bg-indigo-500",
  EN_COURS: "bg-blue-500",
  SOUMIS: "bg-amber-500",
  SOUTENU: "bg-green-500",
  ARCHIVE: "bg-slate-400",
};

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { stats, loading } = useAdminStats();
  const chartId = useId().replace(/:/g, "");

  if (!user || user.role !== "ADMIN") return null;

  const activePercent = stats
    ? Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)
    : 0;

  const barStyles =
    stats && !loading
      ? Object.entries(stats.projectsByStatus)
          .map(([status, count]) => {
            const pct = Math.round((count / stats.totalProjects) * 100);
            return `.bar-${chartId}-${status} { width: ${pct}%; }`;
          })
          .join("\n")
      : "";

  return (
    <div className="space-y-6 animate-fade-in">
      {barStyles && <style>{barStyles}</style>}

      <PageHeader
        title="Tableau de bord Admin"
        description="Vue d'ensemble du système SUSTPA"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Administration" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/audit">
              <Button variant="secondary" size="sm">
                <ClipboardList className="h-4 w-4" />
                Journal d&apos;audit
              </Button>
            </Link>
            <Link href="/admin/users/new">
              <Button variant="primary" size="sm">
                <Users className="h-4 w-4" />
                Créer un compte
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Utilisateurs */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Utilisateurs
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatsCard
              title="Total comptes"
              value={stats?.totalUsers ?? 0}
              icon={<Users className="h-5 w-5" />}
              subtitle={`${activePercent}% actifs`}
              trend="up"
              trendLabel={`${stats?.activeUsers ?? 0} comptes actifs`}
              variant="primary"
            />
            <AdminStatsCard
              title="Étudiants"
              value={stats?.totalStudents ?? 0}
              icon={<GraduationCap className="h-5 w-5" />}
              variant="default"
            />
            <AdminStatsCard
              title="Enseignants"
              value={stats?.totalTeachers ?? 0}
              icon={<BookOpen className="h-5 w-5" />}
              subtitle={`dont ${stats?.totalDeptHeads ?? 0} resp. filière`}
              variant="default"
            />
            <AdminStatsCard
              title="Membres jury"
              value={stats?.totalJury ?? 0}
              icon={<Shield className="h-5 w-5" />}
              variant="default"
            />
          </div>
        )}
      </section>

      {/* Actifs / Inactifs */}
      {!loading && stats && (
        <div className="grid grid-cols-2 gap-4">
          <AdminStatsCard
            title="Comptes actifs"
            value={stats.activeUsers}
            icon={<UserCheck className="h-5 w-5" />}
            variant="success"
          />
          <AdminStatsCard
            title="Comptes inactifs"
            value={stats.totalUsers - stats.activeUsers}
            icon={<UserX className="h-5 w-5" />}
            variant="danger"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Derniers inscrits */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Derniers inscrits</CardTitle>
              <Link
                href="/admin/users"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1"
              >
                Voir tous <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !stats?.recentUsers.length ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="Aucun utilisateur"
                size="sm"
              />
            ) : (
              <div className="space-y-2">
                {stats.recentUsers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/admin/users/${u.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <Avatar
                      firstName={u.firstName}
                      lastName={u.lastName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={ROLE_VARIANTS[u.role] ?? "default"} dot>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                      <span className="text-xs text-slate-300 group-hover:text-slate-400">
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projets par statut */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-600" />
              Projets par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : !stats?.totalProjects ? (
              <EmptyState
                icon={<FolderOpen className="h-6 w-6" />}
                title="Aucun projet"
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {stats.totalProjects}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    projets au total
                  </p>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(stats.projectsByStatus).map(
                    ([status, count]) => {
                      const pct = Math.round(
                        (count / stats.totalProjects) * 100,
                      );
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                              {STATUS_LABELS[status] ?? status}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`bar-${chartId}-${status} h-full rounded-full transition-all duration-500 ${
                                STATUS_COLORS[status] ?? "bg-slate-400"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Créer un compte",
                href: "/admin/users/new",
                icon: "➕",
                color:
                  "hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200",
              },
              {
                label: "Gérer utilisateurs",
                href: "/admin/users",
                icon: "👥",
                color:
                  "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
              },
              {
                label: "Journal d'audit",
                href: "/admin/audit",
                icon: "📋",
                color:
                  "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200",
              },
              {
                label: "Voir les projets",
                href: "/projects",
                icon: "📁",
                color:
                  "hover:bg-green-50 hover:text-green-700 hover:border-green-200",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-border text-center transition-all ${item.color}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium text-slate-700">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
