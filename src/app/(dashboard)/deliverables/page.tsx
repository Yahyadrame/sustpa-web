"use client";

import { useState } from "react";
import { FileText, Search, Upload, Filter, X } from "lucide-react";

import { useDeliverables } from "@/hooks/use-deliverables";
import { useAuthStore } from "@/store/auth.store";
import { projectsApi } from "@/services/projects.service";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { DeliverableCard } from "@/components/deliverables/deliverable-card";
import { UploadZone } from "@/components/deliverables/upload-zone";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DeliverableStatus } from "@/types/deliverable.types";
import type { Project, Milestone } from "@/types/project.types";

const STATUS_OPTIONS: { value: DeliverableStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "REVISION_REQUESTED", label: "Révision demandée" },
];

/* normalizeProject — logique inchangée */
function normalizeProject(raw: unknown): Project {
  if (raw && typeof raw === "object" && "project" in raw) {
    return (raw as { project: Project }).project;
  }
  return raw as Project;
}

export default function DeliverablesPage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const { deliverables, loading, uploading, upload, approve, requestRevision } =
    useDeliverables();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [reviseModal, setReviseModal] = useState<{ open: boolean; id: string }>(
    { open: false, id: "" },
  );
  const [reviseReason, setReviseReason] = useState("");
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState("");

  const isStudent = user?.role === "STUDENT";
  const canReview = user?.role === "TEACHER" || user?.role === "RESPONSIBLE";

  const filtered = deliverables.filter((d) => {
    const matchSearch = (d.title ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  /* handleOpenUpload — logique inchangée */
  const handleOpenUpload = async () => {
    try {
      const raw = await projectsApi.getAll();
      const normalized = (raw as unknown[])
        .map(normalizeProject)
        .filter((p) => p.status === "EN_COURS");
      setMyProjects(normalized);
      setUploadModal(true);
    } catch {
      toast.error("Impossible de charger les projets");
    }
  };

  const selectedProjectObj = myProjects.find((p) => p.id === selectedProject);
  const projectMilestones: Milestone[] = selectedProjectObj?.milestones ?? [];

  const handleUpload = async (file: File, title: string) => {
    if (!selectedProject || !selectedMilestone) {
      toast.error("Sélectionnez un projet et un jalon");
      return;
    }
    await upload(file, selectedMilestone, selectedProject, title);
    setUploadModal(false);
    setSelectedProject("");
    setSelectedMilestone("");
  };

  /* Compteurs par statut pour les chips */
  const counts = {
    total: deliverables.length,
    pending: deliverables.filter((d) => d.status === "PENDING").length,
    approved: deliverables.filter((d) => d.status === "APPROVED").length,
    revision: deliverables.filter((d) => d.status === "REVISION_REQUESTED")
      .length,
  };

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <PageHeader
        title="Livrables"
        description={`${deliverables.length} livrable${deliverables.length > 1 ? "s" : ""}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Livrables" },
        ]}
        actions={
          isStudent && (
            <Button variant="primary" size="md" onClick={handleOpenUpload}>
              <Upload className="h-4 w-4" />
              Déposer un livrable
            </Button>
          )
        }
      />

      {/* ── Stat chips ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          {
            label: "Tous",
            value: "",
            count: counts.total,
            bg: "#F6F8FA",
            border: "#E8ECF0",
            text: "#64748b",
          },
          {
            label: "En attente",
            value: "PENDING",
            count: counts.pending,
            bg: "#fffbeb",
            border: "#fde68a",
            text: "#b45309",
          },
          {
            label: "Approuvés",
            value: "APPROVED",
            count: counts.approved,
            bg: "#edfaf4",
            border: "#a8e9cb",
            text: "#1B8A5A",
          },
          {
            label: "Révision",
            value: "REVISION_REQUESTED",
            count: counts.revision,
            bg: "#fff1f2",
            border: "#fecaca",
            text: "#dc2626",
          },
        ].map((chip) => (
          <button
            key={chip.value}
            onClick={() =>
              setStatusFilter(chip.value as DeliverableStatus | "")
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              statusFilter === chip.value
                ? {
                    background: chip.bg,
                    color: chip.text,
                    border: `1.5px solid ${chip.border}`,
                    boxShadow: `0 0 0 3px ${chip.border}40`,
                  }
                : {
                    background: chip.bg,
                    color: chip.text,
                    border: `1px solid ${chip.border}`,
                  }
            }
          >
            {chip.label}
            <span className="font-bold">{chip.count}</span>
          </button>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div
          className="relative flex-1 max-w-sm flex items-center rounded-xl"
          style={{ background: "#F6F8FA", border: "1.5px solid #E8ECF0" }}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Rechercher un livrable…"
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
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Bouton filtres avancés */}
        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Masquer" : "Filtres"}
        </Button>
      </div>

      {/* Panneau filtres avancés */}
      {showFilters && (
        <div
          className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
          style={{
            background: "#F6F8FA",
            border: "1px solid #E8ECF0",
            animation: "slideDown 0.2s ease-out",
          }}
        >
          <div className="w-full sm:w-56">
            <Select
              label="Statut"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as DeliverableStatus | "")}
            />
          </div>
        </div>
      )}

      {/* ── Grille livrables ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E8ECF0] bg-white p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-24 rounded-full shrink-0" />
              </div>
              <div className="pt-3 border-t border-[#E8ECF0] flex gap-2">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E8ECF0] bg-white">
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Aucun livrable"
            description={
              isStudent
                ? "Déposez votre premier livrable."
                : "Aucun livrable soumis pour le moment."
            }
            action={
              isStudent ? (
                <Button variant="primary" size="sm" onClick={handleOpenUpload}>
                  <Upload className="h-4 w-4" />
                  Déposer
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DeliverableCard
              key={d.id}
              deliverable={d}
              canReview={canReview}
              onApprove={(id) => approve(id)}
              onRequestRevision={(id) => setReviseModal({ open: true, id })}
            />
          ))}
        </div>
      )}

      {/* ══ Modal upload ══ */}
      <Dialog
        open={uploadModal}
        onClose={() => {
          setUploadModal(false);
          setSelectedProject("");
          setSelectedMilestone("");
        }}
        title="Déposer un livrable"
        description="Choisissez le projet et le jalon correspondant."
        size="lg"
      >
        <div className="space-y-5">
          {myProjects.length === 0 ? (
            <div
              className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-amber-400" />
              <p className="text-amber-800 ml-2">
                Aucun projet en cours. Un projet doit être en statut{" "}
                <strong>EN_COURS</strong> pour pouvoir déposer un livrable.
              </p>
            </div>
          ) : (
            <Select
              label="Projet"
              placeholder="Sélectionner un projet"
              options={myProjects.map((p) => ({ value: p.id, label: p.title }))}
              value={selectedProject}
              onChange={(v) => {
                setSelectedProject(v);
                setSelectedMilestone("");
              }}
            />
          )}

          {selectedProject &&
            (projectMilestones.length === 0 ? (
              <div
                className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-amber-400" />
                <p className="text-amber-800 ml-2">
                  Aucun jalon défini pour ce projet. L&apos;encadrant doit
                  d&apos;abord créer des jalons.
                </p>
              </div>
            ) : (
              <Select
                label="Jalon"
                placeholder="Sélectionner un jalon"
                options={projectMilestones.map((m) => ({
                  value: m.id,
                  label: `${m.title} — échéance ${new Date(m.dueDate).toLocaleDateString("fr-FR")}`,
                }))}
                value={selectedMilestone}
                onChange={setSelectedMilestone}
              />
            ))}

          {selectedProject && selectedMilestone && (
            <UploadZone onUpload={handleUpload} uploading={uploading} />
          )}
        </div>
      </Dialog>

      {/* ══ Modal révision ══ */}
      <Dialog
        open={reviseModal.open}
        onClose={() => {
          setReviseModal({ open: false, id: "" });
          setReviseReason("");
        }}
        title="Demander une révision"
        description="Le motif sera envoyé à l'étudiant par email."
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="revise-reason"
              className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
            >
              Motif de révision <span className="text-red-500">*</span>
            </label>
            <textarea
              id="revise-reason"
              rows={4}
              placeholder="Expliquez ce qui doit être corrigé ou amélioré…"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239_68_68/0.10)] transition-all font-sans"
              value={reviseReason}
              onChange={(e) => setReviseReason(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              {reviseReason.trim().length} / 10 min
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setReviseModal({ open: false, id: "" })}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              disabled={reviseReason.trim().length < 10}
              onClick={async () => {
                await requestRevision(reviseModal.id, reviseReason);
                setReviseModal({ open: false, id: "" });
                setReviseReason("");
              }}
            >
              Envoyer la demande
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
