"use client";

import { useState } from "react";
import {
  CalendarPlus,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  Bell,
  Search,
} from "lucide-react";

import { useMeet } from "@/hooks/use-meet";
import { useAuthStore } from "@/store/auth.store";
import { projectsApi } from "@/services/projects.service";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { SessionCard } from "@/components/meet/session-card";
import { SessionReportForm } from "@/components/meet/session-report-form";
import { CreateSessionModal } from "@/components/meet/create-session-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project.types";

type TabKey = "upcoming" | "past" | "all";

/* normalizeProject — logique inchangée */
function normalizeProject(raw: unknown): Project {
  if (raw && typeof raw === "object" && "project" in raw) {
    return (raw as { project: Project }).project;
  }
  return raw as Project;
}

export default function MeetPage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const {
    sessions,
    loading,
    createSession,
    confirmSession,
    submitReport,
    deleteSession,
  } = useMeet();

  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [reportModal, setReportModal] = useState<{ open: boolean; id: string }>(
    { open: false, id: "" },
  );
  const [myProjects, setMyProjects] = useState<Project[]>([]);

  const isTeacher = ["TEACHER", "RESPONSIBLE"].includes(user?.role ?? "");
  const isStudent = user?.role === "STUDENT";

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.scheduledAt) > now);
  const past = sessions.filter((s) => new Date(s.scheduledAt) <= now);

  const byTab =
    activeTab === "upcoming"
      ? upcoming
      : activeTab === "past"
        ? past
        : sessions;

  const displayed = byTab.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  );

  /* handleOpenCreate — logique inchangée */
  const handleOpenCreate = async () => {
    try {
      const raw = await projectsApi.getAll();
      const normalized = (raw as unknown[])
        .map(normalizeProject)
        .filter((p) => p.status === "EN_COURS");
      setMyProjects(normalized);
      setCreateModal(true);
    } catch {
      toast.error("Impossible de charger les projets");
    }
  };

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: "upcoming", label: "À venir", count: upcoming.length },
    { key: "past", label: "Passées", count: past.length },
    { key: "all", label: "Toutes", count: sessions.length },
  ];

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <PageHeader
        title="Sessions Meet"
        description={`${sessions.length} session${sessions.length > 1 ? "s" : ""} au total`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sessions Meet" },
        ]}
        actions={
          isTeacher && (
            <Button variant="primary" size="md" onClick={handleOpenCreate}>
              <CalendarPlus className="h-4 w-4" />
              Planifier une session
            </Button>
          )
        }
      />

      {/* ── Bannière étudiant ── */}
      {isStudent && upcoming.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm overflow-hidden relative"
          style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary-600" />
          <Bell className="h-4 w-4 text-primary-600 shrink-0 ml-1" />
          <span className="text-primary-800">
            Vous avez <strong>{upcoming.length}</strong> session
            {upcoming.length > 1 ? "s" : ""} à venir. Pensez à confirmer votre
            disponibilité.
          </span>
        </div>
      )}

      {/* ── Stats ── */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="À venir"
            value={upcoming.length}
            icon={<Calendar className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Confirmées"
            value={sessions.filter((s) => s.isConfirmed).length}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Archivées"
            value={sessions.filter((s) => !!s.report).length}
            icon={<Video className="h-5 w-5" />}
          />
          <StatCard
            title="Durée moy."
            value={
              sessions.length > 0
                ? `${Math.round(sessions.reduce((acc, s) => acc + s.durationMin, 0) / sessions.length)} min`
                : "—"
            }
            icon={<Clock className="h-5 w-5" />}
          />
        </div>
      )}

      {/* ── Tabs + Recherche ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Tabs pill */}
        <div
          className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={
                activeTab === tab.key
                  ? {
                      background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                      color: "#fff",
                      boxShadow: "0 2px 8px -2px rgb(27 138 90/0.30)",
                    }
                  : { color: "#64748b" }
              }
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={
                    activeTab === tab.key
                      ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                      : { background: "#E8ECF0", color: "#64748b" }
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div
          className="relative flex items-center rounded-xl flex-1 max-w-xs"
          style={{ background: "#F6F8FA", border: "1.5px solid #E8ECF0" }}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Rechercher une session…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-sans tracking-[-0.01em]"
            onFocus={(e) => {
              e.currentTarget.parentElement!.style.borderColor = "#1B8A5A";
              e.currentTarget.parentElement!.style.boxShadow =
                "0 0 0 3px rgb(27 138 90/0.10)";
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.borderColor = "#E8ECF0";
              e.currentTarget.parentElement!.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* ── Grille sessions ── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="pt-3 border-t border-[#E8ECF0] flex gap-2">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-6 w-6 rounded-lg ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-[#E8ECF0] bg-white">
          <EmptyState
            icon={<Video className="h-8 w-8" />}
            title={
              activeTab === "upcoming"
                ? "Aucune session à venir"
                : "Aucune session passée"
            }
            description={
              isTeacher
                ? "Planifiez une session de suivi pour vos étudiants."
                : "Votre encadrant n'a pas encore planifié de session."
            }
            action={
              isTeacher ? (
                <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                  <CalendarPlus className="h-4 w-4" />
                  Planifier
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayed.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              userRole={user!.role}
              onConfirm={confirmSession}
              onReport={(id) => setReportModal({ open: true, id })}
              onDelete={deleteSession}
            />
          ))}
        </div>
      )}

      {/* ── Modal créer session ── */}
      <CreateSessionModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        projects={myProjects}
        onSubmit={async (data) => {
          await createSession(data);
        }}
      />

      {/* ── Modal compte-rendu ── */}
      <Dialog
        open={reportModal.open}
        onClose={() => setReportModal({ open: false, id: "" })}
        title="Saisir le compte-rendu"
        description="Ce compte-rendu sera archivé dans le dossier du projet."
        size="lg"
      >
        <SessionReportForm
          onSubmit={async (report) => {
            await submitReport(reportModal.id, report);
            setReportModal({ open: false, id: "" });
          }}
          onCancel={() => setReportModal({ open: false, id: "" })}
        />
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReportModal({ open: false, id: "" })}
          >
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
