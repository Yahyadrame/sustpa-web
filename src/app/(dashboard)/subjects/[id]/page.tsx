"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  Tag,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  GraduationCap,
  Building2,
  Layers,
  AlertCircle,
  FileText,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import type { SubjectStatus } from "@/types/project.types";

/* ─── Types ─────────────────────────────────────────────────── */
interface Application {
  id: string;
  studentId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string | null;
  createdAt: string;
  student?: { firstName: string; lastName: string; email: string };
}

interface Subject {
  id: string;
  title: string;
  description: string;
  type: "PFE" | "MEMOIRE" | "THESE";
  validationStatus: SubjectStatus;
  isAvailable: boolean;
  rejectionReason: string | null;
  proposedByStudentId: string | null;
  supervisorId: string;
  createdAt: string;
  supervisor?: { firstName: string; lastName: string; email: string } | null;
  applications: Application[];
}

/* ─── Config visuels ────────────────────────────────────────── */
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

const STATUS_CFG: Record<
  SubjectStatus,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  PENDING_VALIDATION: {
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
    label: "En attente",
    icon: <Clock className="h-3 w-3" />,
  },
  VALIDATED: {
    bg: "#edfaf4",
    text: "#1B8A5A",
    border: "#a8e9cb",
    label: "Validé",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  REJECTED: {
    bg: "#fff1f2",
    text: "#dc2626",
    border: "#fecaca",
    label: "Refusé",
    icon: <XCircle className="h-3 w-3" />,
  },
  CLOSED: {
    bg: "#F6F8FA",
    text: "#64748b",
    border: "#E8ECF0",
    label: "Clôturé",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

const APP_CFG: Record<
  "PENDING" | "ACCEPTED" | "REJECTED",
  {
    bg: string;
    text: string;
    border: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    bg: "#F6F8FA",
    text: "#64748b",
    border: "#E8ECF0",
    label: "En attente",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  ACCEPTED: {
    bg: "#edfaf4",
    text: "#1B8A5A",
    border: "#a8e9cb",
    label: "Acceptée",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    bg: "#fff1f2",
    text: "#dc2626",
    border: "#fecaca",
    label: "Refusée",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [showApply, setShowApply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyOk, setApplyOk] = useState(false);

  const canApply = user?.role === "STUDENT";
  const isOwner = subject?.supervisorId === user?.id;
  const isResponsible = ["RESPONSIBLE", "ADMIN"].includes(user?.role ?? "");
  const myApplication = subject?.applications.find(
    (a) => a.studentId === user?.id,
  );
  const canPostuler =
    canApply &&
    subject?.validationStatus === "VALIDATED" &&
    subject?.isAvailable === true;

  /* ── Chargement — logique api inchangée ── */
  const loadSubject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get<Subject>(`/projects/subjects/${id}`);
      setSubject(data);
    } catch {
      setError("Impossible de charger ce sujet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubject();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setApplyError(null);
    try {
      await api.post("/projects/applications/apply", {
        subjectId: id,
        message: message.trim() || undefined,
      });
      setApplyOk(true);
      setShowApply(false);
      await loadSubject();
    } catch (err: unknown) {
      setApplyError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de la candidature",
      );
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) return;
    try {
      await api.delete(`/projects/subjects/${id}`);
      router.push("/subjects");
    } catch {
      setError("Impossible de supprimer le sujet.");
    }
  };

  const handleReviewApplication = async (
    appId: string,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      await api.patch(`/projects/applications/${appId}/review`, { status });
      await loadSubject();
    } catch {
      /* toast global */
    }
  };

  /* ── États de chargement ── */
  if (loading) {
    return (
      <div
        className="space-y-6 max-w-5xl"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
        >
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-slate-500">{error}</p>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  if (!subject) return null;

  const typeCfg = TYPE_CFG[subject.type] ?? {
    bg: "#F6F8FA",
    text: "#64748b",
    border: "#E8ECF0",
    label: subject.type,
  };
  const stsCfg = STATUS_CFG[subject.validationStatus];

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      <PageHeader
        title={subject.title}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bibliothèque sujets", href: "/subjects" },
          {
            label:
              subject.title.length > 35
                ? subject.title.slice(0, 35) + "…"
                : subject.title,
          },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Carte principale */}
          <div
            className="rounded-2xl bg-white p-6 space-y-5"
            style={{
              border: "1px solid #E8ECF0",
              boxShadow:
                "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
            }}
          >
            {/* Badges type + statut */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: typeCfg.bg,
                    color: typeCfg.text,
                    border: `1px solid ${typeCfg.border}`,
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {typeCfg.label}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: stsCfg.bg,
                    color: stsCfg.text,
                    border: `1px solid ${stsCfg.border}`,
                  }}
                >
                  {stsCfg.icon}
                  {stsCfg.label}
                </span>
              </div>
              {isOwner && subject.validationStatus === "REJECTED" && (
                <Button
                  variant="danger"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => void handleDelete()}
                >
                  Supprimer
                </Button>
              )}
            </div>

            {/* Titre + date */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-[-0.03em] leading-snug">
                {subject.title}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Publié le {formatDate(subject.createdAt)}
              </p>
            </div>

            {/* Motif refus */}
            {subject.validationStatus === "REJECTED" &&
              subject.rejectionReason && (
                <div
                  className="rounded-xl p-4 flex gap-3 relative overflow-hidden"
                  style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5 ml-1" />
                  <div>
                    <p className="text-xs font-semibold text-red-800 mb-0.5">
                      Motif du refus
                    </p>
                    <p className="text-sm text-red-700">
                      {subject.rejectionReason}
                    </p>
                  </div>
                </div>
              )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                </div>
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {subject.description}
              </p>
            </div>
          </div>

          {/* Candidatures — encadrant + responsable */}
          {(isOwner || isResponsible) && (
            <div
              className="rounded-2xl bg-white p-6 space-y-4"
              style={{
                border: "1px solid #E8ECF0",
                boxShadow:
                  "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-primary-600" />
                  </div>
                  Candidatures
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {subject.applications.length} candidature
                  {subject.applications.length > 1 ? "s" : ""}
                </span>
              </div>

              {subject.applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    Aucune candidature pour ce sujet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {subject.applications.map((app) => {
                    const appC = APP_CFG[app.status];
                    return (
                      <li
                        key={app.id}
                        className="rounded-xl p-4 space-y-3"
                        style={{
                          background: "#F6F8FA",
                          border: "1px solid #E8ECF0",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar initiales */}
                            <div
                              className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{
                                background: "#edfaf4",
                                color: "#1B8A5A",
                                border: "1px solid #a8e9cb",
                              }}
                            >
                              {app.student
                                ? `${app.student.firstName[0]}${app.student.lastName[0]}`
                                : "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 tracking-[-0.01em]">
                                {app.student
                                  ? `${app.student.firstName} ${app.student.lastName}`
                                  : "Étudiant"}
                              </p>
                              {app.student && (
                                <p className="text-xs text-slate-400">
                                  {app.student.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                            style={{
                              background: appC.bg,
                              color: appC.text,
                              border: `1px solid ${appC.border}`,
                            }}
                          >
                            {appC.icon}
                            {appC.label}
                          </span>
                        </div>

                        {app.message && (
                          <div
                            className="rounded-lg px-3 py-2.5 text-xs text-slate-500 leading-relaxed"
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid #E8ECF0",
                            }}
                          >
                            {app.message}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400">
                          Soumise le {formatDate(app.createdAt)}
                        </p>

                        {app.status === "PENDING" && isOwner && (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                void handleReviewApplication(app.id, "ACCEPTED")
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                              style={{
                                background: "#edfaf4",
                                color: "#1B8A5A",
                                border: "1px solid #a8e9cb",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#d2f4e4";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#edfaf4";
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Accepter
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleReviewApplication(app.id, "REJECTED")
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                              style={{
                                background: "#fff1f2",
                                color: "#dc2626",
                                border: "1px solid #fecaca",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fee2e2";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff1f2";
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Encadrant proposant */}
          <div
            className="rounded-2xl bg-white p-5 space-y-4"
            style={{
              border: "1px solid #E8ECF0",
              boxShadow:
                "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
            }}
          >
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary-50 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary-600" />
              </div>
              Encadrant proposant
            </h3>
            {subject.supervisor ? (
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: "#edfaf4",
                    color: "#1B8A5A",
                    border: "1px solid #a8e9cb",
                  }}
                >
                  {subject.supervisor.firstName[0]}
                  {subject.supervisor.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate tracking-[-0.02em]">
                    {subject.supervisor.firstName} {subject.supervisor.lastName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {subject.supervisor.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Informations non disponibles
              </p>
            )}
          </div>

          {/* Informations */}
          <div
            className="rounded-2xl bg-white p-5 space-y-3"
            style={{
              border: "1px solid #E8ECF0",
              boxShadow:
                "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)",
            }}
          >
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-slate-500" />
              </div>
              Informations
            </h3>
            <dl className="space-y-3 text-sm">
              {[
                {
                  icon: <GraduationCap className="h-3.5 w-3.5" />,
                  label: "Type",
                  value: typeCfg.label,
                },
                {
                  icon: <Users className="h-3.5 w-3.5" />,
                  label: "Candidatures",
                  value: `${subject.applications.length}`,
                },
                {
                  icon: <Building2 className="h-3.5 w-3.5" />,
                  label: "Statut",
                  value: stsCfg.label,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between"
                >
                  <dt className="text-slate-500 flex items-center gap-1.5">
                    {row.icon}
                    {row.label}
                  </dt>
                  <dd className="font-semibold text-slate-700 text-right text-xs">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* CTA Étudiant — logique inchangée */}
          {canApply && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
            >
              {applyOk && (
                <div
                  className="flex items-center gap-2 rounded-xl p-3 text-xs font-medium"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #a8e9cb",
                    color: "#1B8A5A",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Votre candidature a été envoyée !
                </div>
              )}

              {myApplication ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Votre candidature
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: APP_CFG[myApplication.status].bg,
                      color: APP_CFG[myApplication.status].text,
                      border: `1px solid ${APP_CFG[myApplication.status].border}`,
                    }}
                  >
                    {APP_CFG[myApplication.status].icon}
                    {APP_CFG[myApplication.status].label}
                  </span>
                </div>
              ) : canPostuler && !showApply ? (
                <Button className="w-full" onClick={() => setShowApply(true)}>
                  <Send className="h-4 w-4" />
                  Postuler à ce sujet
                </Button>
              ) : canPostuler && showApply ? (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Message de motivation{" "}
                    <span className="font-normal text-slate-400">
                      (optionnel)
                    </span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Expliquez pourquoi ce sujet vous intéresse…"
                    className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
                  />
                  {applyError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-red-500 inline-block" />
                      {applyError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => void handleApply()}
                      disabled={applying}
                    >
                      {applying ? "Envoi…" : "Confirmer"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowApply(false);
                        setApplyError(null);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <XCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Ce sujet n&apos;est pas disponible pour candidature.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
