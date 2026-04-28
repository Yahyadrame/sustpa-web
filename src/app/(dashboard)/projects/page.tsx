"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FolderOpen, BookOpen, Filter } from "lucide-react";

import { useProjects } from "@/hooks/use-projects";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge, Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectType } from "@/types/project.types";

const TYPE_LABELS: Record<ProjectType, string> = {
  PFE: "PFE",
  MEMOIRE: "Mémoire",
  THESE: "Thèse",
};

const TYPE_VARIANTS: Record<ProjectType, "info" | "violet" | "warning"> = {
  PFE: "info",
  MEMOIRE: "violet",
  THESE: "warning",
};

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "PROPOSITION", label: "Proposition" },
  { value: "EN_COURS", label: "En cours" },
  { value: "SOUMIS", label: "Soumis" },
  { value: "SOUTENU", label: "Soutenu" },
  { value: "ARCHIVE", label: "Archivé" },
];

/* normalizeProject — logique inchangée */
function normalizeProject(raw: unknown): Project {
  if (raw && typeof raw === "object" && "project" in raw) {
    const r = raw as { project: Project; student?: unknown };
    return r.project;
  }
  return raw as Project;
}

export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user);
  const {
    projects: rawProjects,
    loading,
    approveProject,
    rejectProject,
    archiveProject,
  } = useProjects();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>(
    { open: false, id: "" },
  );
  const [rejectReason, setRejectReason] = useState("");

  const projects = (rawProjects as unknown[]).map(normalizeProject);

  const filtered = projects.filter((p) => {
    const matchSearch = (p.title ?? "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  /* RBAC — logique CDC v2 R1 inchangée */
  const canCreate = user?.role === "ADMIN";
  const canReview = ["RESPONSIBLE", "ADMIN"].includes(user?.role ?? "");
  const isStudent = user?.role === "STUDENT";

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <PageHeader
        title="Projets"
        description={`${projects.length} projet${projects.length > 1 ? "s" : ""} au total`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projets" },
        ]}
        actions={
          canCreate && (
            <Link href="/projects/new">
              <Button variant="primary" size="md">
                <Plus className="h-4 w-4" />
                Nouveau projet
              </Button>
            </Link>
          )
        }
      />

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div
          className="relative flex-1 max-w-sm flex items-center rounded-xl transition-all"
          style={{ background: "#F6F8FA", border: "1.5px solid #E8ECF0" }}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400 shrink-0 pointer-events-none" />
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
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtre statut */}
        <div className="flex items-center gap-2 w-full sm:w-52">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            className="flex-1"
          />
        </div>
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl border"
          style={{ background: "#FFFFFF", border: "1px solid #E8ECF0" }}
        >
          <EmptyState
            icon={<FolderOpen className="h-8 w-8" />}
            title="Aucun projet trouvé"
            description={
              search
                ? "Essayez avec d'autres termes de recherche."
                : isStudent
                  ? "Vos projets apparaîtront ici une fois un sujet validé par le Responsable."
                  : "Aucun projet disponible."
            }
            action={
              isStudent ? (
                <Link href="/subjects/new">
                  <Button variant="primary" size="sm">
                    <BookOpen className="h-4 w-4" />
                    Proposer un sujet
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Créé le</TableHead>
              {canReview && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id}>
                {/* Titre — lien */}
                <TableCell>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold text-slate-800 hover:text-primary-700 transition-colors truncate max-w-xs block tracking-[-0.01em]"
                  >
                    {project.title}
                  </Link>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge
                    variant={TYPE_VARIANTS[project.type] ?? "default"}
                    size="sm"
                  >
                    {TYPE_LABELS[project.type] ?? project.type}
                  </Badge>
                </TableCell>

                {/* Statut */}
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>

                {/* Année */}
                <TableCell>
                  <span className="text-sm text-slate-500 font-mono tracking-tight">
                    {project.academicYear}
                  </span>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <span className="text-sm text-slate-400">
                    {formatDate(project.createdAt)}
                  </span>
                </TableCell>

                {/* Actions RESPONSIBLE/ADMIN */}
                {canReview && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {project.status === "PROPOSITION" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => approveProject(project.id)}
                          >
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              setRejectModal({ open: true, id: project.id })
                            }
                          >
                            Refuser
                          </Button>
                        </>
                      )}
                      {project.status === "SOUTENU" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => archiveProject(project.id)}
                        >
                          Archiver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ── Modal refus ── */}
      <Dialog
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, id: "" });
          setRejectReason("");
        }}
        title="Refuser le projet"
        description="Un motif de refus est obligatoire et sera communiqué à l'étudiant."
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
              Motif de refus <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Expliquez pourquoi ce projet est refusé…"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans tracking-[-0.01em]"
            />
            <p className="text-xs text-slate-400">
              {rejectReason.trim().length} / 10 caractères minimum
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectModal({ open: false, id: "" });
                setRejectReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              disabled={rejectReason.trim().length < 10}
              onClick={async () => {
                await rejectProject(rejectModal.id, rejectReason);
                setRejectModal({ open: false, id: "" });
                setRejectReason("");
              }}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
