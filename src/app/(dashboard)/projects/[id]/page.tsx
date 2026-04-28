"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Flag,
  FileText,
  Building2,
  TrendingUp,
} from "lucide-react";

import { projectsApi } from "@/services/projects.service";
import { usersApi } from "@/services/users.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge, Badge } from "@/components/ui/badge";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import type { Project, Milestone } from "@/types/project.types";
import type { UserDetail } from "@/types/user.types";

/* ── Icônes jalons ─────────────────────────────────────────── */
const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-primary-600" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  OVERDUE: <AlertCircle className="h-4 w-4 text-red-500" />,
  PENDING: <Clock className="h-4 w-4 text-slate-400" />,
};

const MILESTONE_RING: Record<string, string> = {
  COMPLETED: "#a8e9cb",
  IN_PROGRESS: "#bfdbfe",
  OVERDUE: "#fecaca",
  PENDING: "#E8ECF0",
};

const MILESTONE_BG: Record<string, string> = {
  COMPLETED: "#edfaf4",
  IN_PROGRESS: "#eff6ff",
  OVERDUE: "#fff1f2",
  PENDING: "#F6F8FA",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [teachers, setTeachers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const [assignModal, setAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    dueDate: "",
    description: "",
    isFinal: false,
  });

  /* ── RBAC — logique CDC v2 R7 inchangée ── */
  const isHead = ["RESPONSIBLE", "ADMIN"].includes(user?.role ?? "");
  const isTeacher = user?.role === "TEACHER";
  const isResponsibleEncadrant = isHead && project?.supervisorId === user?.id;
  const canSetFinal = isTeacher || isResponsibleEncadrant;

  /* ── Chargement ── */
  const loadProject = useCallback(async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        projectsApi.getById(id),
        isHead ? usersApi.getTeachers() : Promise.resolve([] as UserDetail[]),
      ] as const);
      setProject(p);
      setTeachers(t);
    } finally {
      setLoading(false);
    }
  }, [id, isHead]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  if (loading || !project) return null;

  /* ── Calculs ── */
  const milestones = project.milestones ?? [];
  const completedMilestones = milestones.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const totalMilestones = milestones.length;
  const progress =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  /* Nom encadrant — logique inchangée */
  const supervisorName = (() => {
    if (!project.supervisorId) return null;
    const found = teachers.find((t) => t.id === project.supervisorId);
    if (found) return `${found.firstName} ${found.lastName}`;
    if (isTeacher && project.supervisorId === user?.id)
      return `${user.firstName} ${user.lastName}`;
    return "Encadrant affecté";
  })();

  const alreadyHasSupervisor = !!project.supervisorId;

  /* ── Handlers — logique inchangée ── */
  const handleAssign = async () => {
    if (!selectedTeacher) return;
    await projectsApi.assignSupervisor(project.id, selectedTeacher);
    toast.success("Encadrant affecté");
    setAssignModal(false);
    setSelectedTeacher("");
    setProject(await projectsApi.getById(id));
  };

  const handleMilestone = async () => {
    if (!milestoneForm.title || !milestoneForm.dueDate) return;
    await projectsApi.createMilestone(project.id, {
      title: milestoneForm.title,
      dueDate: new Date(milestoneForm.dueDate).toISOString(),
      order: (project.milestones?.length ?? 0) + 1,
      description: milestoneForm.description || undefined,
      isFinal: milestoneForm.isFinal,
    });
    toast.success(
      milestoneForm.isFinal
        ? "Jalon final ajouté — le projet passera à SOUMIS lors de l'approbation du livrable"
        : "Jalon ajouté",
    );
    setMilestoneModal(false);
    setMilestoneForm({
      title: "",
      dueDate: "",
      description: "",
      isFinal: false,
    });
    setProject(await projectsApi.getById(id));
  };

  const handleSetFinal = async (milestoneId: string) => {
    await projectsApi.setMilestoneFinal(project.id, milestoneId);
    toast.success(
      "Jalon final défini — le projet passera à SOUMIS lors de l'approbation du livrable",
    );
    setProject(await projectsApi.getById(id));
  };

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <PageHeader
        title={project.title}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projets", href: "/projects" },
          {
            label:
              project.title.length > 30
                ? project.title.slice(0, 30) + "…"
                : project.title,
          },
        ]}
        badge={
          <div className="flex items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            <Badge variant="default">{project.type}</Badge>
            <span className="text-xs text-slate-400 font-mono">
              {project.academicYear}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            {/* RBAC CDC v2 R7 — logique inchangée */}
            {isHead && project.status === "EN_COURS" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAssignModal(true)}
              >
                <User2 className="h-4 w-4" />
                {alreadyHasSupervisor
                  ? "Remplacer encadrant"
                  : "Affecter encadrant"}
              </Button>
            )}
            {(isTeacher || isResponsibleEncadrant) &&
              project.status === "EN_COURS" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMilestoneModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter jalon
                </Button>
              )}
          </div>
        }
      />

      {/* ── Corps ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-slate-600" />
                </div>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed text-[0.9rem] whitespace-pre-line">
                {project.description}
              </p>
              {project.rejectionReason && (
                <div
                  className="mt-4 rounded-xl p-4 text-sm overflow-hidden relative"
                  style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
                  <p className="font-semibold text-red-800 mb-1 ml-2">
                    Motif de refus :
                  </p>
                  <p className="text-red-700 ml-2">{project.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jalons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-primary-600" />
                  </div>
                  Jalons
                </CardTitle>
                {totalMilestones > 0 && (
                  <span className="text-xs text-slate-400 font-medium">
                    {completedMilestones}/{totalMilestones} complétés
                  </span>
                )}
              </div>
              {totalMilestones > 0 && (
                <div className="mt-3">
                  <Progress value={progress} size="sm" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-6 w-6" />}
                  title="Aucun jalon défini"
                  description="L'encadrant définira les jalons une fois le projet affecté."
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {milestones.map((m: Milestone, idx: number) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-3 p-4 rounded-xl transition-all"
                      style={{
                        background: MILESTONE_BG[m.status] ?? "#F6F8FA",
                        border: `1px solid ${MILESTONE_RING[m.status] ?? "#E8ECF0"}`,
                      }}
                    >
                      {/* Numéro + icône */}
                      <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "#FFFFFF",
                            border: `2px solid ${MILESTONE_RING[m.status] ?? "#E8ECF0"}`,
                          }}
                        >
                          <span className="text-slate-500">{idx + 1}</span>
                        </div>
                        <div>{MILESTONE_ICONS[m.status]}</div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800 tracking-[-0.02em]">
                            {m.title}
                          </p>
                          {m.isFinal && (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: "#edfaf4",
                                color: "#1B8A5A",
                                border: "1px solid #a8e9cb",
                              }}
                            >
                              <Flag className="h-3 w-3" />
                              Jalon final
                            </span>
                          )}
                          {canSetFinal &&
                            !m.isFinal &&
                            project.status === "EN_COURS" && (
                              <button
                                type="button"
                                onClick={() => handleSetFinal(m.id)}
                                className="text-xs text-slate-400 hover:text-primary-600 transition-colors underline underline-offset-2"
                              >
                                Marquer comme final
                              </button>
                            )}
                        </div>
                        {m.description && (
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {m.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          Échéance : {formatDate(m.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar droite ── */}
        <div className="space-y-4">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-slate-600" />
                </div>
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 text-sm">
              {/* Créé le */}
              <div className="py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
                  Créé le
                </p>
                <p className="text-slate-700">
                  {formatDate(project.createdAt)}
                </p>
              </div>
              <Separator className="my-0" />

              {/* Mise à jour */}
              <div className="py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
                  Dernière mise à jour
                </p>
                <p className="text-slate-700">
                  {formatDate(project.updatedAt)}
                </p>
              </div>
              <Separator className="my-0" />

              {/* Encadrant */}
              <div className="py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
                  Encadrant
                </p>
                {supervisorName ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "#edfaf4", color: "#1B8A5A" }}
                    >
                      {supervisorName.charAt(0)}
                    </div>
                    <p className="text-slate-800 font-semibold tracking-[-0.01em]">
                      {supervisorName}
                    </p>
                  </div>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{
                      background: "#fffbeb",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                    }}
                  >
                    Non affecté
                  </span>
                )}
              </div>
              <Separator className="my-0" />

              {/* Jalon final */}
              <div className="py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-1">
                  Jalon final
                </p>
                {milestones.some((m) => m.isFinal) ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                    <p className="text-primary-700 font-semibold text-xs truncate">
                      {milestones.find((m) => m.isFinal)?.title}
                    </p>
                  </div>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{
                      background: "#fffbeb",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                    }}
                  >
                    Non défini
                  </span>
                )}
              </div>

              {/* Progression */}
              {totalMilestones > 0 && (
                <>
                  <Separator className="my-0" />
                  <div className="py-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2">
                      Progression
                    </p>
                    <Progress value={progress} showValue size="md" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats jalons */}
          {totalMilestones > 0 && (
            <Card variant="ghost">
              <CardContent className="pt-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-3">
                  Répartition jalons
                </p>
                <div className="space-y-2">
                  {[
                    {
                      status: "COMPLETED",
                      label: "Complétés",
                      color: "#1B8A5A",
                    },
                    {
                      status: "IN_PROGRESS",
                      label: "En cours",
                      color: "#2563eb",
                    },
                    { status: "OVERDUE", label: "En retard", color: "#dc2626" },
                    {
                      status: "PENDING",
                      label: "En attente",
                      color: "#94a3b8",
                    },
                  ].map((s) => {
                    const count = milestones.filter(
                      (m) => m.status === s.status,
                    ).length;
                    if (count === 0) return null;
                    return (
                      <div
                        key={s.status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: s.color }}
                          />
                          <span className="text-xs text-slate-500">
                            {s.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ══ Modal affecter / remplacer encadrant ══ */}
      <Dialog
        open={assignModal}
        onClose={() => {
          setAssignModal(false);
          setSelectedTeacher("");
        }}
        title={
          alreadyHasSupervisor
            ? "Remplacer l'encadrant"
            : "Affecter un encadrant"
        }
        description={
          alreadyHasSupervisor
            ? `Encadrant actuel : ${supervisorName ?? "inconnu"}. Choisissez un remplaçant.`
            : "Choisissez un encadrant disponible pour ce projet."
        }
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Encadrant"
            placeholder="Sélectionner un enseignant"
            options={teachers
              .filter((t) => t.id !== project.supervisorId)
              .map((t) => ({
                value: t.id,
                label: `${t.firstName} ${t.lastName}`,
              }))}
            value={selectedTeacher}
            onChange={setSelectedTeacher}
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setAssignModal(false);
                setSelectedTeacher("");
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleAssign} disabled={!selectedTeacher}>
              {alreadyHasSupervisor ? "Remplacer" : "Affecter"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* ══ Modal ajouter jalon ══ */}
      <Dialog
        open={milestoneModal}
        onClose={() => setMilestoneModal(false)}
        title="Ajouter un jalon"
        size="md"
      >
        <div className="space-y-4">
          {/* Titre */}
          <div className="space-y-1.5">
            <label
              htmlFor="ms-title"
              className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
            >
              Titre
            </label>
            <input
              id="ms-title"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-2.75 text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
              placeholder="Ex : Rapport intermédiaire"
              value={milestoneForm.title}
              onChange={(e) =>
                setMilestoneForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>

          {/* Date limite */}
          <div className="space-y-1.5">
            <label
              htmlFor="ms-date"
              className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
            >
              Date limite
            </label>
            <input
              id="ms-date"
              type="date"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-2.75 text-[0.9375rem] text-slate-900 focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
              value={milestoneForm.dueDate}
              onChange={(e) =>
                setMilestoneForm((f) => ({ ...f, dueDate: e.target.value }))
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="ms-desc"
              className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
            >
              Description{" "}
              <span className="text-xs text-slate-400 font-normal">
                (optionnel)
              </span>
            </label>
            <textarea
              id="ms-desc"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-[0.9375rem] text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
              rows={3}
              placeholder="Description du jalon…"
              value={milestoneForm.description}
              onChange={(e) =>
                setMilestoneForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          {/* Checkbox jalon final — visible pour canSetFinal (CDC v2 R7) */}
          {canSetFinal && (
            <label
              className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all"
              style={{
                background: milestoneForm.isFinal ? "#edfaf4" : "#F6F8FA",
                border: `1.5px solid ${milestoneForm.isFinal ? "#a8e9cb" : "#E8ECF0"}`,
              }}
            >
              <input
                type="checkbox"
                checked={milestoneForm.isFinal}
                onChange={(e) =>
                  setMilestoneForm((f) => ({ ...f, isFinal: e.target.checked }))
                }
                className="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 tracking-[-0.01em]">
                  <Flag className="h-3.5 w-3.5 text-primary-600" />
                  Jalon final
                </p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Le projet passera automatiquement à SOUMIS quand un livrable
                  de ce jalon sera approuvé
                </p>
              </div>
            </label>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setMilestoneModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleMilestone}
              disabled={!milestoneForm.title || !milestoneForm.dueDate}
            >
              <TrendingUp className="h-4 w-4" />
              Ajouter
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
