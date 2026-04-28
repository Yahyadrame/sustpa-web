"use client";

import { useAuthStore } from "@/store/auth.store";
import { useReporting } from "@/hooks/use-reporting";
import { PageHeader } from "@/components/ui/page-header";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { ResponsibleDashboard } from "@/components/dashboard/responsible-dashboard";
import { JuryDashboard } from "@/components/dashboard/jury-dashboard";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Étudiant",
  TEACHER: "Enseignant",
  RESPONSIBLE: "Responsable de filière",
  JURY_MEMBER: "Membre du jury",
  ADMIN: "Administrateur",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { globalStats, teacherStats, studentStats, loading } = useReporting(
    user?.role,
  );

  if (!user) return null;

  const greeting = getGreeting();
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  /* RESPONSIBLE encadrant — affiché seulement s'il gère ≥1 projet */
  const showTeacherStats =
    !loading && teacherStats && teacherStats.totalProjects > 0;

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <PageHeader
        title={`${greeting}, ${user.firstName} 👋`}
        description={`${roleLabel} — Département Informatique`}
      />

      {/* ── Contenu par rôle ── */}
      {user.role === "STUDENT" && (
        <StudentDashboard
          stats={studentStats}
          loading={loading}
          name={user.firstName}
        />
      )}

      {user.role === "TEACHER" && (
        <TeacherDashboard stats={teacherStats} loading={loading} />
      )}

      {user.role === "RESPONSIBLE" && (
        <>
          <ResponsibleDashboard stats={globalStats} loading={loading} />

          {/* Section encadrant conditionnelle */}
          {showTeacherStats && (
            <div className="space-y-4">
              {/* Séparateur labelé */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E8ECF0]" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] px-3">
                  En tant qu&apos;encadrant
                </span>
                <div className="h-px flex-1 bg-[#E8ECF0]" />
              </div>
              <TeacherDashboard stats={teacherStats} loading={loading} />
            </div>
          )}
        </>
      )}

      {user.role === "ADMIN" && (
        <ResponsibleDashboard stats={globalStats} loading={loading} />
      )}

      {user.role === "JURY_MEMBER" && <JuryDashboard name={user.firstName} />}
    </div>
  );
}
