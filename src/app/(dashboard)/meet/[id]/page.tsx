"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  ExternalLink,
  Info,
} from "lucide-react";

import { meetApi } from "@/services/meet.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { SessionReportForm } from "@/components/meet/session-report-form";
import { formatDate } from "@/lib/utils";
import type { MeetSession } from "@/types/meet.types";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${h}h${rem}min` : `${h}h`;
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  /* toastRef — logique inchangée */
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [session, setSession] = useState<MeetSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const isTeacher = ["TEACHER", "RESPONSIBLE"].includes(user?.role ?? "");
  const isStudent = user?.role === "STUDENT";

  /* Chargement — logique inchangée */
  useEffect(() => {
    if (!id || id === "undefined") return;
    meetApi
      .getById(id)
      .then(setSession)
      .catch(() => toastRef.current.error("Session introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !session) return null;

  const upcoming = new Date(session.scheduledAt) > new Date();

  const handleConfirm = async () => {
    await meetApi.confirm(id);
    toastRef.current.success("Disponibilité confirmée");
    setSession((s) => (s ? { ...s, isConfirmed: true } : s));
  };

  const handleReport = async (report: string) => {
    const updated = await meetApi.submitReport(id, report);
    toastRef.current.success("Compte-rendu archivé");
    setSession(updated as MeetSession);
    setShowReport(false);
  };

  /* Badge statut */
  const statusCfg = session.report
    ? { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb", label: "Archivée" }
    : session.isConfirmed
      ? {
          bg: "#edfaf4",
          text: "#1B8A5A",
          border: "#a8e9cb",
          label: "Confirmée",
        }
      : upcoming
        ? {
            bg: "#fffbeb",
            text: "#b45309",
            border: "#fde68a",
            label: "Planifiée",
          }
        : {
            bg: "#F6F8FA",
            text: "#64748b",
            border: "#E8ECF0",
            label: "Passée",
          };

  return (
    <div
      className="space-y-6 max-w-3xl"
      style={{ animation: "fadeIn 0.22s ease-out" }}
    >
      {/* ── En-tête ── */}
      <PageHeader
        title={session.title}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sessions Meet", href: "/meet" },
          {
            label:
              session.title.length > 30
                ? session.title.slice(0, 30) + "…"
                : session.title,
          },
        ]}
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: statusCfg.bg,
                color: statusCfg.text,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full inline-block"
                style={{ background: statusCfg.text }}
              />
              {statusCfg.label}
            </span>
            <span className="text-sm text-slate-400">
              {new Date(session.scheduledAt).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            {upcoming && (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[0.625rem] text-sm font-semibold text-white transition-all shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                  boxShadow: "0 4px 12px -2px rgb(27 138 90/0.30)",
                }}
              >
                <Video className="h-4 w-4" />
                Rejoindre la session
              </a>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ordre du jour */}
          {session.agenda && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#F6F8FA] flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  Ordre du jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {session.agenda}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Lien Meet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Video className="h-3.5 w-3.5 text-primary-600" />
                </div>
                Lien de réunion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                  }}
                >
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 tracking-[-0.01em]">
                    Session Jitsi Meet
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {session.meetingLink}
                  </p>
                </div>
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg transition-all hover:shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvrir
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Compte-rendu */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-primary-600" />
                  </div>
                  Compte-rendu
                </CardTitle>
                {isTeacher && !session.report && !upcoming && (
                  <Button
                    variant={showReport ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => setShowReport((v) => !v)}
                  >
                    {showReport ? "Annuler" : "Saisir le CR"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showReport ? (
                <SessionReportForm
                  onSubmit={handleReport}
                  onCancel={() => setShowReport(false)}
                />
              ) : session.report ? (
                <div
                  className="p-4 rounded-xl relative overflow-hidden"
                  style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary-600" />
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line ml-2">
                    {session.report}
                  </p>
                  {session.archivedAt && (
                    <p
                      className="text-xs font-semibold mt-3 ml-2"
                      style={{ color: "#1B8A5A" }}
                    >
                      ✓ Archivé le {formatDate(session.archivedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-4 text-center">
                  {upcoming
                    ? "Le compte-rendu sera saisi après la séance."
                    : "Aucun compte-rendu saisi pour le moment."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bandeau confirmation étudiant */}
          {isStudent && !session.isConfirmed && upcoming && (
            <div
              className="rounded-xl p-4 flex items-center justify-between gap-4 overflow-hidden relative"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-amber-400" />
              <div className="ml-2">
                <p className="text-sm font-semibold text-amber-900 tracking-[-0.01em]">
                  Confirmez votre disponibilité
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Votre encadrant attend votre confirmation.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleConfirm}>
                <CheckCircle2 className="h-4 w-4" />
                Confirmer
              </Button>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div>
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
                {
                  label: "Date",
                  icon: <Calendar className="h-3.5 w-3.5 text-slate-400" />,
                  value: new Date(session.scheduledAt).toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  ),
                },
                {
                  label: "Heure",
                  icon: <Clock className="h-3.5 w-3.5 text-slate-400" />,
                  value: new Date(session.scheduledAt).toLocaleTimeString(
                    "fr-FR",
                    { hour: "2-digit", minute: "2-digit" },
                  ),
                },
                {
                  label: "Durée",
                  icon: <Clock className="h-3.5 w-3.5 text-slate-400" />,
                  value: formatDuration(session.durationMin),
                },
                {
                  label: "Participants",
                  icon: <Users className="h-3.5 w-3.5 text-slate-400" />,
                  value: "2 (encadrant + étudiant)",
                },
                {
                  label: "Planifiée le",
                  icon: <Calendar className="h-3.5 w-3.5 text-slate-400" />,
                  value: formatDate(session.createdAt),
                },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="my-0" />}
                  <div className="py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.icon}
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-slate-700 pl-5 font-medium tracking-[-0.01em] capitalize">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
