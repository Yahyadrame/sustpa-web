"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  FileText,
  ExternalLink,
  History,
  Shield,
  Info,
} from "lucide-react";

import { deliverablesApi } from "@/services/deliverables.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { VersionHistory } from "@/components/deliverables/version-history";
import { ReviewPanel } from "@/components/deliverables/review-panel";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import type { Deliverable, AuditEntry } from "@/types/deliverable.types";
import { Button } from "@/components/ui/button";

/* ── Config statuts ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    variant: "warning" as const,
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#b45309",
  },
  APPROVED: {
    label: "Approuvé",
    variant: "success" as const,
    bg: "#edfaf4",
    border: "#a8e9cb",
    text: "#1B8A5A",
  },
  REVISION_REQUESTED: {
    label: "Révision demandée",
    variant: "danger" as const,
    bg: "#fff1f2",
    border: "#fecaca",
    text: "#dc2626",
  },
};

/* ── Audit labels ───────────────────────────────────────────── */
const AUDIT_LABELS: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  DELIVERABLE_UPLOADED: { label: "Déposé", color: "#2563eb", dot: "#bfdbfe" },
  DELIVERABLE_APPROVED: { label: "Approuvé", color: "#1B8A5A", dot: "#a8e9cb" },
  DELIVERABLE_REVISION_REQUESTED: {
    label: "Révision demandée",
    color: "#d97706",
    dot: "#fde68a",
  },
  COMMENT_ADDED: { label: "Commentaire", color: "#64748b", dot: "#E8ECF0" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DeliverableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const toastRef = useRef(toast);

  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── RBAC — useMemo avant tout return conditionnel ── */
  const canReview = useMemo(
    () => user?.role === "TEACHER" || user?.role === "RESPONSIBLE",
    [user?.role],
  );
  const canComment = useMemo(
    () => ["TEACHER", "JURY_MEMBER", "RESPONSIBLE"].includes(user?.role ?? ""),
    [user?.role],
  );
  const canAudit = useMemo(
    () => ["TEACHER", "RESPONSIBLE", "ADMIN"].includes(user?.role ?? ""),
    [user?.role],
  );
  const isStudent = useMemo(() => user?.role === "STUDENT", [user?.role]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [d, audit] = await Promise.all([
        deliverablesApi.getById(id),
        canAudit ? deliverablesApi.getAuditLog(id) : Promise.resolve([]),
      ]);
      setDeliverable(d);
      setAuditLog(audit);
    } catch {
      toastRef.current.error("Impossible de charger le livrable");
    } finally {
      setLoading(false);
    }
  }, [id, canAudit]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Dernier commentaire révision — memo inchangé */
  const lastRevisionComment = useMemo(() => {
    if (!deliverable || deliverable.status !== "REVISION_REQUESTED")
      return null;
    const revisionReviews = (deliverable.reviews ?? []).filter(
      (r) => r.status === "REVISION_REQUESTED",
    );
    if (revisionReviews.length === 0) return null;
    return revisionReviews[revisionReviews.length - 1]?.comment ?? null;
  }, [deliverable]);

  if (loading || !deliverable) return null;

  const statusCfg = STATUS_CONFIG[deliverable.status];
  const streamUrl = `/api/v1/deliverables/${deliverable.id}/stream`;

  const handleApprove = async (comment?: string) => {
    await deliverablesApi.review(id, "APPROVED", comment);
    toastRef.current.success("Livrable approuvé");
    fetchData();
  };
  const handleRevision = async (comment: string) => {
    await deliverablesApi.review(id, "REVISION_REQUESTED", comment);
    toastRef.current.warning("Révision demandée");
    fetchData();
  };
  const handleComment = async (comment: string) => {
    await deliverablesApi.addComment(id, comment);
    toastRef.current.success("Annotation ajoutée");
    fetchData();
  };

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <PageHeader
        title={deliverable.title}
        description={`Version ${deliverable.version} · ${formatBytes(deliverable.fileSize)} · ${deliverable.mimeType.split("/").pop()?.toUpperCase() ?? ""}`}
        breadcrumb={[
          { label: "Livrables", href: "/deliverables" },
          {
            label:
              deliverable.title.length > 30
                ? deliverable.title.slice(0, 30) + "…"
                : deliverable.title,
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            <Badge variant="default">v{deliverable.version}</Badge>
            <a
              href={streamUrl}
              download={deliverable.title}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[0.625rem] text-sm font-medium text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                boxShadow: "0 4px 12px -2px rgb(27 138 90/0.30)",
              }}
            >
              <Download className="h-4 w-4" />
              Télécharger
            </a>
          </div>
        }
      />

      {/* ── Bandeau révision étudiant — logique inchangée ── */}
      {isStudent && deliverable.status === "REVISION_REQUESTED" && (
        <div
          className="flex items-start gap-3 rounded-xl p-4 overflow-hidden relative"
          style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ml-1"
            style={{ background: "#fee2e2" }}
          >
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 mb-1 tracking-[-0.01em]">
              Révision demandée par votre encadrant
            </p>
            {lastRevisionComment ? (
              <p className="text-sm text-red-700 leading-relaxed whitespace-pre-line">
                {lastRevisionComment}
              </p>
            ) : (
              <p className="text-sm text-red-500 italic">
                Consultez l&apos;onglet Revues pour plus de détails.
              </p>
            )}
            <p className="text-xs text-red-400 mt-2">
              Déposez une nouvelle version corrigée pour reprendre le suivi.
            </p>
          </div>
        </div>
      )}

      {/* ── Corps ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Aperçu fichier */}
          {deliverable.mimeType === "application/pdf" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    Fichier PDF
                  </span>
                  <a
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ouvrir dans un nouvel onglet
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src={streamUrl}
                  className="w-full border-0 block rounded-b-2xl"
                  height={500}
                  title={deliverable.title}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  Fichier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed"
                  style={{ background: "#F6F8FA", borderColor: "#E8ECF0" }}
                >
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center text-4xl mb-4"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E8ECF0",
                      boxShadow: "0 2px 8px -2px rgb(0 0 0/0.08)",
                    }}
                  >
                    {deliverable.mimeType.includes("zip") ? "📦" : "📝"}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 tracking-[-0.01em]">
                    {deliverable.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatBytes(deliverable.fileSize)} ·{" "}
                    {deliverable.mimeType.split("/").pop()?.toUpperCase()}
                  </p>
                  <a
                    href={streamUrl}
                    download={deliverable.title}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                      boxShadow: "0 4px 12px -2px rgb(27 138 90/0.30)",
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Onglets Revues / Audit */}
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger
                value="reviews"
                icon={<FileText className="h-3.5 w-3.5" />}
              >
                Revues ({deliverable.reviews?.length ?? 0})
              </TabsTrigger>
              {canAudit && (
                <TabsTrigger
                  value="audit"
                  icon={<Shield className="h-3.5 w-3.5" />}
                >
                  Audit ({auditLog.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="reviews">
              <Card>
                <CardContent className="pt-4">
                  <ReviewPanel
                    deliverableId={id}
                    reviews={deliverable.reviews ?? []}
                    currentStatus={deliverable.status}
                    canReview={canReview}
                    canComment={canComment}
                    onApprove={handleApprove}
                    onRevision={handleRevision}
                    onComment={handleComment}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {canAudit && (
              <TabsContent value="audit">
                <Card>
                  <CardContent className="pt-4">
                    {auditLog.length === 0 ? (
                      <EmptyState
                        icon={<Shield className="h-6 w-6" />}
                        title="Aucune entrée d'audit"
                        size="sm"
                      />
                    ) : (
                      <div className="space-y-0">
                        {auditLog.map((entry, idx) => {
                          const cfg = AUDIT_LABELS[entry.action] ?? {
                            label: entry.action,
                            color: "#64748b",
                            dot: "#E8ECF0",
                          };
                          const isLast = idx === auditLog.length - 1;
                          return (
                            <div
                              key={entry.id}
                              className="relative flex gap-4 pb-4"
                            >
                              {/* Ligne verticale */}
                              {!isLast && (
                                <div className="absolute left-2.75 top-7 bottom-0 w-0.5 bg-[#E8ECF0]" />
                              )}
                              {/* Dot */}
                              <div
                                className="relative z-10 mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  background: "#FFFFFF",
                                  border: `2px solid ${cfg.dot}`,
                                }}
                              >
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: cfg.color }}
                                />
                              </div>
                              {/* Contenu */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: cfg.color }}
                                  >
                                    {cfg.label}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {formatDate(entry.createdAt)}
                                  </span>
                                </div>
                                {entry.metadata &&
                                  (() => {
                                    try {
                                      const meta = JSON.parse(
                                        entry.metadata,
                                      ) as Record<string, unknown>;
                                      return meta.comment ? (
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                          &ldquo;{String(meta.comment)}&rdquo;
                                        </p>
                                      ) : null;
                                    } catch {
                                      return null;
                                    }
                                  })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Statut en avant */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
            }}
          >
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ background: statusCfg.text }}
            />
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: statusCfg.text }}
              >
                Statut
              </p>
              <p className="text-sm font-semibold text-slate-800 tracking-[-0.01em]">
                {statusCfg.label}
              </p>
            </div>
          </div>

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                  <Info className="h-3.5 w-3.5 text-slate-500" />
                </div>
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 text-sm">
              {[
                { label: "Version", value: `v${deliverable.version}` },
                { label: "Taille", value: formatBytes(deliverable.fileSize) },
                {
                  label: "Format",
                  value:
                    deliverable.mimeType.split("/").pop()?.toUpperCase() ?? "—",
                },
                {
                  label: "Déposé le",
                  value: formatDate(deliverable.createdAt),
                },
                {
                  label: "Mis à jour",
                  value: formatDate(deliverable.updatedAt),
                },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="my-0" />}
                  <div className="py-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">
                      {item.label}
                    </p>
                    <p className="text-slate-700 mt-0.5 font-medium tracking-[-0.01em]">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Historique versions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <History className="h-3.5 w-3.5 text-primary-600" />
                </div>
                Versions ({deliverable.versions?.length ?? 1})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VersionHistory
                versions={deliverable.versions ?? [deliverable]}
                currentId={deliverable.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
