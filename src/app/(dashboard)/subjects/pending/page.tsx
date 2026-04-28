"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Tag,
  Search,
  GraduationCap,
  AlertCircle,
  Shield,
} from "lucide-react";

import { usePendingSubjects } from "@/hooks/use-subjects";
import { useAuthStore } from "@/store/auth.store";
import { usersApi } from "@/services/users.service";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  PendingSubjectItem,
  ValidateSubjectPayload,
} from "@/types/project.types";
import type { UserDetail } from "@/types/user.types";

/* ── Config visuels ─────────────────────────────────────────── */
const TYPE_CFG: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  PFE: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "PFE" },
  MEMOIRE: {
    bg: "#f5f3ff",
    text: "#6d28d9",
    border: "#ddd6fe",
    label: "Mémoire",
  },
  THESE: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", label: "Thèse" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ─── Modal de décision — logique inchangée ─────────────────── */
interface DecisionModalProps {
  item: PendingSubjectItem;
  teachers: UserDetail[];
  open: boolean;
  onClose: () => void;
  onSubmit: (
    subjectId: string,
    payload: ValidateSubjectPayload,
  ) => Promise<void>;
}

function DecisionModal({
  item,
  teachers,
  open,
  onClose,
  onSubmit,
}: DecisionModalProps) {
  const [action, setAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reason, setReason] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudentSubject = !!item.subject.proposedByStudentId;

  const handleClose = () => {
    setAction("APPROVE");
    setReason("");
    setSupervisorId("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (action === "REJECT" && !reason.trim()) {
      setError("Le motif de refus est obligatoire");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(item.subject.id, {
        action,
        reason: action === "REJECT" ? reason.trim() : undefined,
        supervisorId:
          action === "APPROVE" && supervisorId ? supervisorId : undefined,
      });
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={`Décision — ${item.subject.title}`}
      description="Validez ou refusez ce sujet. Un motif est obligatoire en cas de refus."
      size="md"
    >
      <div className="space-y-5">
        {/* Résumé sujet */}
        <div
          className="rounded-xl p-4 space-y-2.5"
          style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: TYPE_CFG[item.subject.type]?.bg ?? "#F6F8FA",
                color: TYPE_CFG[item.subject.type]?.text ?? "#64748b",
                border: `1px solid ${TYPE_CFG[item.subject.type]?.border ?? "#E8ECF0"}`,
              }}
            >
              <Tag className="h-3 w-3" />
              {TYPE_CFG[item.subject.type]?.label ?? item.subject.type}
            </span>
            {isStudentSubject && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: "#f5f3ff",
                  color: "#6d28d9",
                  border: "1px solid #ddd6fe",
                }}
              >
                <GraduationCap className="h-3 w-3" />
                Proposé par un étudiant
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 tracking-[-0.02em]">
            {item.subject.title}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.subject.description}
          </p>
          {item.proposedBy && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {item.proposedBy.firstName} {item.proposedBy.lastName} —{" "}
              {item.proposedBy.email}
            </p>
          )}
        </div>

        {/* Toggle Valider / Refuser */}
        <div
          className="flex rounded-xl overflow-hidden p-1"
          style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
        >
          <button
            type="button"
            onClick={() => setAction("APPROVE")}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all"
            style={
              action === "APPROVE"
                ? {
                    background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                    color: "#fff",
                    boxShadow: "0 2px 8px -2px rgb(27 138 90/0.30)",
                  }
                : { color: "#64748b" }
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            Valider
          </button>
          <button
            type="button"
            onClick={() => setAction("REJECT")}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all"
            style={
              action === "REJECT"
                ? {
                    background: "#dc2626",
                    color: "#fff",
                    boxShadow: "0 2px 8px -2px rgb(220 38 38/0.30)",
                  }
                : { color: "#64748b" }
            }
          >
            <XCircle className="h-4 w-4" />
            Refuser
          </button>
        </div>

        {/* Encadrant optionnel (si APPROVE) */}
        {action === "APPROVE" && (
          <div className="space-y-1.5">
            <Select
              label={
                isStudentSubject
                  ? "Remplacer l'encadrant pressenti (optionnel)"
                  : "Affecter un autre encadrant (optionnel)"
              }
              placeholder="Conserver l'encadrant initial"
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.firstName} ${t.lastName}`,
              }))}
              value={supervisorId}
              onChange={setSupervisorId}
            />
            {isStudentSubject && !supervisorId && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" />
                L&apos;encadrant choisi par l&apos;étudiant sera conservé si
                vous ne sélectionnez pas de remplacement.
              </p>
            )}
          </div>
        )}

        {/* Motif refus */}
        {action === "REJECT" && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
              Motif du refus <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi ce sujet est refusé…"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239_68_68/0.10)] transition-all font-sans"
            />
          </div>
        )}

        {error && (
          <div
            className="flex items-center gap-2 rounded-xl p-3 text-xs overflow-hidden relative"
            style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 ml-1" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            isLoading={submitting}
            variant={action === "REJECT" ? "danger" : "primary"}
          >
            {action === "APPROVE" ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Valider le sujet
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Refuser le sujet
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

/* ─── Page principale ───────────────────────────────────────── */
export default function PendingSubjectsPage() {
  const user = useAuthStore((s) => s.user);
  const { pendingSubjects, loading, validateSubject } = usePendingSubjects();

  const [teachers, setTeachers] = useState<UserDetail[]>([]);
  const [teachersLoaded, setTeachersLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<PendingSubjectItem | null>(
    null,
  );

  /* Lazy-load teachers — logique inchangée */
  const openModal = async (item: PendingSubjectItem) => {
    if (!teachersLoaded) {
      const data = await usersApi.getTeachers();
      setTeachers(data);
      setTeachersLoaded(true);
    }
    setSelectedItem(item);
  };

  /* Guard RBAC — logique inchangée */
  if (user?.role !== "RESPONSIBLE" && user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
        >
          <Shield className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-slate-500">
          Accès réservé au responsable de département
        </p>
      </div>
    );
  }

  const filtered = pendingSubjects.filter((item) =>
    item.subject.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      <PageHeader
        title="Sujets en attente de validation"
        description={
          loading
            ? "Chargement…"
            : `${pendingSubjects.length} sujet${pendingSubjects.length > 1 ? "s" : ""} à traiter`
        }
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sujets", href: "/subjects" },
          { label: "En attente" },
        ]}
        actions={
          <Link href="/subjects">
            <Button variant="secondary" size="sm">
              Bibliothèque sujets
            </Button>
          </Link>
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
          placeholder="Rechercher un sujet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-sans"
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

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3"
            >
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E8ECF0] bg-white">
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8" />}
            title="Aucun sujet en attente"
            description="Tous les sujets ont été traités."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isStudentSubject = !!item.subject.proposedByStudentId;
            const typeCfg = TYPE_CFG[item.subject.type] ?? {
              bg: "#F6F8FA",
              text: "#64748b",
              border: "#E8ECF0",
              label: item.subject.type,
            };

            return (
              <div
                key={item.subject.id}
                className="rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5"
                style={{
                  border: "1px solid #E8ECF0",
                  boxShadow:
                    "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                        style={{
                          background: typeCfg.bg,
                          color: typeCfg.text,
                          border: `1px solid ${typeCfg.border}`,
                        }}
                      >
                        <Tag className="h-3 w-3" />
                        {typeCfg.label}
                      </span>
                      {isStudentSubject && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                          style={{
                            background: "#f5f3ff",
                            color: "#6d28d9",
                            border: "1px solid #ddd6fe",
                          }}
                        >
                          <GraduationCap className="h-3 w-3" />
                          Étudiant
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                        style={{
                          background: "#fffbeb",
                          color: "#b45309",
                          border: "1px solid #fde68a",
                        }}
                      >
                        <Clock className="h-3 w-3" />
                        En attente
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-800 leading-snug tracking-[-0.02em]">
                      {item.subject.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.subject.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.proposedBy
                          ? `${item.proposedBy.firstName} ${item.proposedBy.lastName}`
                          : "Enseignant"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.subject.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/subjects/${item.subject.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir détail
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void openModal(item)}
                    >
                      Décider
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal décision */}
      {selectedItem && (
        <DecisionModal
          item={selectedItem}
          teachers={teachers}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={validateSubject}
        />
      )}
    </div>
  );
}
