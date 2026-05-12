"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  Calendar,
  MapPin,
  Search,
  Star,
  Users,
  X,
  GraduationCap,
} from "lucide-react";

import { useDefense } from "@/hooks/use-defense";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { projectsApi } from "@/services/projects.service";
import { usersApi } from "@/services/users.service";
import { defenseApi } from "@/services/defense.service";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project.types";
import type { UserDetail } from "@/types/user.types";
import type { JuryRole } from "@/types/defense.types";

interface SelectedMember {
  teacherId: string;
  juryRole: JuryRole;
}

const JURY_ROLE_OPTIONS: { value: JuryRole; label: string }[] = [
  { value: "PRESIDENT", label: "Président" },
  { value: "RAPPORTEUR", label: "Rapporteur" },
  { value: "EXAMINATEUR", label: "Examinateur" },
];

const JURY_ROLE_CFG: Record<
  JuryRole,
  { bg: string; text: string; border: string }
> = {
  PRESIDENT: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  RAPPORTEUR: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  EXAMINATEUR: { bg: "#F6F8FA", text: "#64748b", border: "#E8ECF0" },
  ENCADRANT: { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb" },
};

/* localDatetimeToISO — logique inchangée */
function localDatetimeToISO(value: string): string {
  if (!value) return "";
  return `${value}:00.000Z`;
}

function getMentionLabel(grade: number | null): string {
  if (grade === null) return "—";
  if (grade >= 16) return "Très Bien";
  if (grade >= 14) return "Bien";
  if (grade >= 12) return "Assez Bien";
  if (grade >= 10) return "Passable";
  return "Insuffisant";
}

export default function DefensePage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const { defenses, loading, refetch } = useDefense();

  const [search, setSearch] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [createModal, setCreateModal] = useState(false);
  const [submittedProjects, setSubmittedProjects] = useState<Project[]>([]);
  const [teachers, setTeachers] = useState<UserDetail[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdDefenseId, setCreatedDefenseId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [currentSupervisorId, setCurrentSupervisorId] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState({
    projectId: "",
    scheduledAt: "",
    room: "",
  });

  const isHead = ["RESPONSIBLE", "ADMIN"].includes(user?.role ?? "");

  const filtered = defenses.filter((d) =>
    (d.project?.title ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const projectIdsWithDefense = new Set(defenses.map((d) => d.projectId));

  /* handleOpenCreate — logique inchangée */
  const handleOpenCreate = async () => {
    try {
      const all = await projectsApi.getAll();
      const soumis = (all as unknown[])
        .map((raw) => {
          if (raw && typeof raw === "object" && "project" in raw)
            return (raw as { project: Project }).project;
          return raw as Project;
        })
        .filter(
          (p) => p.status === "SOUMIS" && !projectIdsWithDefense.has(p.id),
        );
      setSubmittedProjects(soumis);
      setStep(1);
      setCreateModal(true);
    } catch {
      toast.error("Impossible de charger les projets");
    }
  };

  /* handleStep1Next — logique inchangée */
  const handleStep1Next = async () => {
    if (!form.projectId || !form.scheduledAt || !form.room) return;
    setSubmitting(true);
    try {
      const isoDate = localDatetimeToISO(form.scheduledAt);
      const defense = await defenseApi.create({
        projectId: form.projectId,
        scheduledAt: isoDate,
        room: form.room,
      });
      setCreatedDefenseId(defense.id);
      const proj = submittedProjects.find((p) => p.id === form.projectId);
      setCurrentSupervisorId(proj?.supervisorId ?? null);
      setLoadingTeachers(true);
      const teacherList = await usersApi.getTeachers();
      setTeachers(teacherList);
      setLoadingTeachers(false);
      setStep(2);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la planification",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* handleStep2Submit — logique inchangée */
  const handleStep2Submit = async () => {
    if (!createdDefenseId) return;
    if (
      selectedMembers.filter((m) => m.juryRole === "PRESIDENT").length !== 1
    ) {
      toast.error("Désignez exactement 1 Président de jury");
      return;
    }
    setSubmitting(true);
    try {
      await defenseApi.assignJury(createdDefenseId, {
        members: selectedMembers,
      });
      toast.success("Soutenance planifiée et jury constitué");
      handleClose();
      refetch();
    } catch {
      toast.error("Erreur lors de l'affectation du jury");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipJury = () => {
    toast.success("Soutenance planifiée — jury à affecter ultérieurement");
    handleClose();
    refetch();
  };

  const handleClose = () => {
    setCreateModal(false);
    setStep(1);
    setForm({ projectId: "", scheduledAt: "", room: "" });
    setSelectedMembers([]);
    setCreatedDefenseId(null);
    setCurrentSupervisorId(null);
  };

  /* toggleMember + setMemberRole — logique inchangée */
  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m.teacherId === id);
      if (exists) return prev.filter((m) => m.teacherId !== id);
      return [...prev, { teacherId: id, juryRole: "EXAMINATEUR" }];
    });
  };

  const setMemberRole = (teacherId: string, juryRole: JuryRole) => {
    if (juryRole === "PRESIDENT") {
      const existingPresident = selectedMembers.find(
        (m) => m.juryRole === "PRESIDENT" && m.teacherId !== teacherId,
      );
      if (existingPresident) {
        toast.error("Un Président est déjà désigné — retirez-le d'abord");
        return;
      }
    }
    setSelectedMembers((prev) =>
      prev.map((m) => (m.teacherId === teacherId ? { ...m, juryRole } : m)),
    );
  };

  const presidentCount = selectedMembers.filter(
    (m) => m.juryRole === "PRESIDENT",
  ).length;
  const availableTeachers = teachers.filter(
    (t) => t.id !== currentSupervisorId,
  );

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      <PageHeader
        title="Soutenances"
        description={`${defenses.length} soutenance${defenses.length > 1 ? "s" : ""}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Soutenances" },
        ]}
        actions={
          isHead &&
          !loading && (
            <Button variant="primary" size="md" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Planifier une soutenance
            </Button>
          )
        }
      />

      {/* Recherche */}
      <div
        className="relative max-w-sm flex items-center rounded-xl"
        style={{ background: "#F6F8FA", border: "1.5px solid #E8ECF0" }}
      >
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher un projet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-sans tracking-[-0.01em]"
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

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
            >
              <div className="flex justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E8ECF0] bg-white">
          <EmptyState
            icon={<Shield className="h-8 w-8" />}
            title="Aucune soutenance"
            description={
              search
                ? "Aucun résultat."
                : isHead
                  ? "Planifiez la première soutenance."
                  : "Aucune soutenance planifiée."
            }
            action={
              isHead ? (
                <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4" />
                  Planifier
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((defense) => {
            const upcoming = new Date(defense.scheduledAt) > new Date();
            const hasGrade = defense.finalGrade !== null;
            const dateStr = new Date(defense.scheduledAt).toLocaleDateString(
              "fr-FR",
              {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            );
            const timeStr = new Date(defense.scheduledAt).toLocaleTimeString(
              "fr-FR",
              { hour: "2-digit", minute: "2-digit" },
            );

            return (
              <Link key={defense.id} href={`/defense/${defense.id}`}>
                <div
                  className="rounded-2xl bg-white transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full p-5 space-y-3"
                  style={{
                    border: hasGrade
                      ? "1px solid #a8e9cb"
                      : upcoming
                        ? "1px solid #bfdbfe"
                        : "1px solid #E8ECF0",
                    boxShadow:
                      "0 0 0 1px rgb(0 0 0/0.02), 0 2px 6px 0 rgb(0 0 0/0.04)",
                    background: hasGrade
                      ? "#f8fdfb"
                      : upcoming
                        ? "#f8faff"
                        : "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px -4px rgb(0 0 0/0.10)";
                    e.currentTarget.style.borderColor = hasGrade
                      ? "#6ad9ac"
                      : upcoming
                        ? "#93c5fd"
                        : "#a8e9cb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 0 1px rgb(0 0 0/0.02), 0 2px 6px 0 rgb(0 0 0/0.04)";
                    e.currentTarget.style.borderColor = hasGrade
                      ? "#a8e9cb"
                      : upcoming
                        ? "#bfdbfe"
                        : "#E8ECF0";
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 flex-1 tracking-[-0.02em]">
                      {(defense.project as { title: string } | undefined)?.title || "Projet sans titre"}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold shrink-0"
                      style={
                        hasGrade
                          ? {
                              background: "#edfaf4",
                              color: "#1B8A5A",
                              border: "1px solid #a8e9cb",
                            }
                          : upcoming
                            ? {
                                background: "#fffbeb",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                              }
                            : {
                                background: "#F6F8FA",
                                color: "#64748b",
                                border: "1px solid #E8ECF0",
                              }
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full inline-block"
                        style={{
                          background: hasGrade
                            ? "#1B8A5A"
                            : upcoming
                              ? "#d97706"
                              : "#94a3b8",
                        }}
                      />
                      {hasGrade ? "Notée" : upcoming ? "Planifiée" : "Passée"}
                    </span>
                  </div>

                  {/* Type */}
                  {defense.project?.type && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold"
                      style={{
                        background: "#f5f3ff",
                        color: "#6d28d9",
                        border: "1px solid #ddd6fe",
                      }}
                    >
                      {defense.project.type}
                    </span>
                  )}

                  {/* Infos grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        icon: <Calendar className="h-3.5 w-3.5" />,
                        label: "Date",
                        value: dateStr,
                      },
                      {
                        icon: <Shield className="h-3.5 w-3.5" />,
                        label: "Heure",
                        value: timeStr,
                      },
                      {
                        icon: <MapPin className="h-3.5 w-3.5" />,
                        label: "Salle",
                        value: defense.room ?? "À définir",
                      },
                      {
                        icon: <Users className="h-3.5 w-3.5" />,
                        label: "Jury",
                        value: defense.jury?.length
                          ? `${defense.jury.length} membre${defense.jury.length > 1 ? "s" : ""}`
                          : "Non affecté",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-2 p-2.5 rounded-xl"
                        style={{
                          background: "#F6F8FA",
                          border: "1px solid #E8ECF0",
                        }}
                      >
                        <span className="text-slate-400 shrink-0 mt-0.5">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400">
                            {item.label}
                          </p>
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Note finale */}
                  {hasGrade && (
                    <div
                      className="flex items-center gap-2 pt-3"
                      style={{ borderTop: "1px solid #a8e9cb" }}
                    >
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-800">
                        {defense.finalGrade}/20
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
                        style={{ background: "#edfaf4", color: "#1B8A5A" }}
                      >
                        {getMentionLabel(defense.finalGrade)}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ══ Modal 2 étapes ══ */}
      <Dialog
        open={createModal}
        onClose={handleClose}
        title={step === 1 ? "Planifier une soutenance" : "Affecter le jury"}
        description={
          step === 1
            ? "Sélectionnez un projet soumis et définissez la date et la salle."
            : "Sélectionnez les membres du jury et attribuez leurs rôles. L'encadrant est déjà membre automatiquement."
        }
        size="md"
      >
        {/* ── Étape 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Indicateur étapes */}
            <div className="flex items-center gap-2 mb-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  {s > 1 && <div className="h-px w-8 bg-[#E8ECF0]" />}
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={
                      step === s
                        ? {
                            background:
                              "linear-gradient(135deg, #1B8A5A, #156e48)",
                            color: "#fff",
                          }
                        : {
                            background: "#F6F8FA",
                            color: "#94a3b8",
                            border: "1px solid #E8ECF0",
                          }
                    }
                  >
                    {s}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: step === s ? "#1B8A5A" : "#94a3b8" }}
                  >
                    {s === 1 ? "Planification" : "Jury"}
                  </span>
                </div>
              ))}
            </div>

            {/* Projet */}
            <div className="space-y-1.5">
              <label
                htmlFor="defense-project"
                className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
              >
                Projet <span className="text-red-500">*</span>
              </label>
              {submittedProjects.length === 0 ? (
                <div
                  className="rounded-xl p-4 text-sm overflow-hidden relative"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-amber-400" />
                  <p className="text-amber-800 ml-2">
                    Aucun projet en statut <strong>SOUMIS</strong> sans
                    soutenance planifiée.
                  </p>
                </div>
              ) : (
                <select
                  id="defense-project"
                  value={form.projectId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, projectId: e.target.value }))
                  }
                  className="w-full appearance-none rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-[0.6875rem] text-[0.9375rem] text-slate-900 focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
                >
                  <option value="">Sélectionner un projet…</option>
                  {submittedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {p.type} ({p.academicYear})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="defense-date"
                className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
              >
                Date et heure <span className="text-red-500">*</span>
              </label>
              <input
                id="defense-date"
                type="datetime-local"
                className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-[0.6875rem] text-[0.9375rem] text-slate-900 focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
                value={form.scheduledAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduledAt: e.target.value }))
                }
              />
            </div>

            {/* Salle */}
            <div className="space-y-1.5">
              <label
                htmlFor="defense-room"
                className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
              >
                Salle <span className="text-red-500">*</span>
              </label>
              <input
                id="defense-room"
                type="text"
                className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-[0.6875rem] text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
                placeholder="Ex : Amphi A, Salle 204…"
                value={form.room}
                onChange={(e) =>
                  setForm((f) => ({ ...f, room: e.target.value }))
                }
              />
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleStep1Next}
                disabled={
                  !form.projectId ||
                  !form.scheduledAt ||
                  !form.room ||
                  submitting ||
                  submittedProjects.length === 0
                }
                isLoading={submitting}
              >
                <Calendar className="h-4 w-4" />
                Suivant — Affecter le jury
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Étape 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Info encadrant auto */}
            <div
              className="flex items-center gap-2 rounded-xl p-3 text-sm overflow-hidden relative"
              style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary-600" />
              <Shield className="h-4 w-4 text-primary-600 ml-1 shrink-0" />
              <span className="text-primary-800 font-medium">
                L&apos;encadrant du projet est déjà membre du jury
                automatiquement.
              </span>
            </div>

            {/* Membres sélectionnés */}
            {selectedMembers.length > 0 && (
              <div
                className="space-y-2 p-3 rounded-xl"
                style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
              >
                <p className="text-xs font-semibold text-primary-700 mb-1">
                  Sélectionnés ({selectedMembers.length}/5)
                </p>
                {selectedMembers.map((m) => {
                  const t = teachers.find((x) => x.id === m.teacherId);
                  const fullName = t
                    ? `${t.firstName} ${t.lastName}`
                    : m.teacherId;
                  const presidentTaken = selectedMembers.some(
                    (x) =>
                      x.juryRole === "PRESIDENT" && x.teacherId !== m.teacherId,
                  );
                  const roleCfg = JURY_ROLE_CFG[m.juryRole];

                  return (
                    <div
                      key={m.teacherId}
                      className="flex items-center gap-2 bg-white rounded-xl px-3 py-2"
                      style={{ border: "1px solid #a8e9cb" }}
                    >
                      <span className="flex-1 text-xs font-medium text-slate-700 truncate">
                        {fullName}
                      </span>
                      <select
                        value={m.juryRole}
                        onChange={(e) =>
                          setMemberRole(m.teacherId, e.target.value as JuryRole)
                        }
                        className="text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none border cursor-pointer"
                        style={{
                          background: roleCfg.bg,
                          color: roleCfg.text,
                          borderColor: roleCfg.border,
                        }}
                      >
                        {JURY_ROLE_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={
                              opt.value === "PRESIDENT" && presidentTaken
                            }
                          >
                            {opt.value === "PRESIDENT" && presidentTaken
                              ? "Président (déjà assigné)"
                              : opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => toggleMember(m.teacherId)}
                        aria-label="Retirer"
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                {presidentCount === 0 && (
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#b45309" }}
                  >
                    ⚠ Désignez un Président de jury
                  </p>
                )}
              </div>
            )}

            {/* Liste enseignants */}
            <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1 no-scrollbar">
              {loadingTeachers
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                : availableTeachers.map((t) => {
                    const isSelected = selectedMembers.some(
                      (m) => m.teacherId === t.id,
                    );
                    const isDisabled =
                      !isSelected && selectedMembers.length >= 5;

                    return (
                      <label
                        key={t.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-all",
                          isDisabled
                            ? "opacity-40 cursor-not-allowed border-transparent"
                            : "cursor-pointer",
                          isSelected
                            ? "border-primary-200"
                            : !isDisabled
                              ? "border-transparent hover:bg-[#F6F8FA] hover:border-[#E8ECF0]"
                              : "border-transparent",
                        )}
                        style={isSelected ? { background: "#edfaf4" } : {}}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => toggleMember(t.id)}
                          className="sr-only"
                        />
                        <Avatar
                          firstName={t.firstName}
                          lastName={t.lastName}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            {t.firstName} {t.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {t.email}
                          </p>
                        </div>
                        <div
                          className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={
                            isSelected
                              ? {
                                  background: "#1B8A5A",
                                  borderColor: "#1B8A5A",
                                }
                              : { borderColor: "#C8CDD5" }
                          }
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-3 w-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <polyline points="1.5,6 5,9.5 10.5,2.5" />
                            </svg>
                          )}
                        </div>
                      </label>
                    );
                  })}
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={handleSkipJury}>
                Ignorer — affecter plus tard
              </Button>
              <Button
                onClick={handleStep2Submit}
                disabled={
                  selectedMembers.length === 0 ||
                  presidentCount !== 1 ||
                  submitting
                }
                isLoading={submitting}
              >
                <Users className="h-4 w-4" />
                Affecter le jury ({selectedMembers.length})
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </div>
  );
}
