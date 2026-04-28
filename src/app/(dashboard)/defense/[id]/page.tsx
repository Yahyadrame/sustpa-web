"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Shield, Calendar, MapPin, Star,
  Users, CheckCircle2, FileText, Download, Loader2, Info,
} from "lucide-react";

import { defenseApi }  from "@/services/defense.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast }    from "@/components/ui/toast";
import { Badge }       from "@/components/ui/badge";
import { Button }      from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator }   from "@/components/ui/separator";
import { Avatar }      from "@/components/ui/avatar";
import { GradeForm }   from "@/components/defense/grade-form";
import { AssignJuryModal } from "@/components/defense/assign-jury-modal";
import { PageHeader }  from "@/components/ui/page-header";
import { formatDate }  from "@/lib/utils";
import type { Defense, AssignJuryPayload } from "@/types/defense.types";

function getMentionLabel(grade: number | null): string {
  if (grade === null) return "—";
  if (grade >= 16) return "Très Bien";
  if (grade >= 14) return "Bien";
  if (grade >= 12) return "Assez Bien";
  if (grade >= 10) return "Passable";
  return "Insuffisant";
}

const JURY_ROLE_LABEL: Record<string, string> = {
  PRESIDENT:   "Président",
  RAPPORTEUR:  "Rapporteur",
  EXAMINATEUR: "Examinateur",
  ENCADRANT:   "Encadrant",
};

const JURY_ROLE_CFG: Record<string, { bg: string; text: string; border: string }> = {
  PRESIDENT:   { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  RAPPORTEUR:  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  EXAMINATEUR: { bg: "#F6F8FA", text: "#64748b", border: "#E8ECF0" },
  ENCADRANT:   { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb" },
};

export default function DefenseDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const user     = useAuthStore((s) => s.user);
  const toast    = useToast();
  const toastRef = useRef(toast);

  useEffect(() => { toastRef.current = toast; }, [toast]);

  const [defense,          setDefense]          = useState<Defense | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [refreshKey,       setRefreshKey]       = useState(0);
  const [showGrade,        setShowGrade]        = useState(false);
  const [assignJuryModal,  setAssignJuryModal]  = useState(false);
  const [generatingPV,     setGeneratingPV]     = useState(false);

  const isHead = ["RESPONSIBLE", "ADMIN"].includes(user?.role ?? "");
  const isJury = user?.role === "JURY_MEMBER";

  const refresh = useCallback(() => { setLoading(true); setRefreshKey((k) => k + 1); }, []);

  /* Chargement — logique inchangée */
  useEffect(() => {
    if (!id || id === "undefined") return;
    let active = true;
    void defenseApi.getById(id)
      .then((data) => { if (active) { setDefense(data); setLoading(false); } })
      .catch(() => { if (active) { setLoading(false); toastRef.current.error("Soutenance introuvable"); } });
    return () => { active = false; };
  }, [id, refreshKey]);

  if (loading || !defense) return null;

  const upcoming          = new Date(defense.scheduledAt) > new Date();
  const hasGrade          = defense.finalGrade !== null;
  const project           = defense.project as { id?: string; title: string; type: string; supervisorId?: string } | undefined;
  const supervisorId      = defense.jury?.find((j) => j.juryRole === "ENCADRANT")?.teacherId ?? null;
  const hasMinutes        = !!defense.minutesUrl;
  const minutesStreamUrl  = defenseApi.getMinutesStreamUrl(id);

  /* Handlers — logique inchangée */
  const handleGrade = async (grade: number, remarks?: string, comment?: string) => {
    await defenseApi.grade(id, { grade, remarks, comment });
    toastRef.current.success(isHead ? "Note finale enregistrée" : "Note soumise");
    setShowGrade(false); refresh();
  };

  const handleAssignJury = async (_: string, payload: AssignJuryPayload) => {
    await defenseApi.assignJury(id, payload);
    toastRef.current.success("Jury constitué");
    setAssignJuryModal(false); refresh();
  };

  const handleGeneratePV = async () => {
    setGeneratingPV(true);
    try {
      await defenseApi.generateMinutes(id);
      toastRef.current.success("Procès-verbal généré", "Le PDF est disponible en téléchargement.");
      refresh();
    } catch (err: unknown) {
      toastRef.current.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Impossible de générer le procès-verbal");
    } finally { setGeneratingPV(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl" style={{ animation: "fadeIn 0.22s ease-out" }}>

      {/* ── En-tête ── */}
      <PageHeader
        title={project?.title ?? "Soutenance"}
        breadcrumb={[
          { label: "Dashboard",    href: "/dashboard" },
          { label: "Soutenances", href: "/defense"    },
          { label: project?.title ?? "Soutenance" },
        ]}
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={hasGrade ? "success" : upcoming ? "warning" : "default"} dot>
              {hasGrade ? "Notée" : upcoming ? "Planifiée" : "Passée"}
            </Badge>
            {project?.type && <Badge variant="default">{project.type}</Badge>}
            {hasMinutes && <Badge variant="success" dot>PV disponible</Badge>}
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />Retour
            </Button>
            {isHead && (
              <Button variant="secondary" size="sm" onClick={() => setAssignJuryModal(true)}>
                <Users className="h-4 w-4" />
                {defense.jury?.length ? "Modifier le jury" : "Affecter le jury"}
              </Button>
            )}
            {(isJury || isHead) && !hasGrade && !upcoming && (
              <Button variant="primary" size="sm" onClick={() => setShowGrade((v) => !v)}>
                <Star className="h-4 w-4" />
                {isHead ? "Note finale" : "Ma note"}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Note finale */}
          {hasGrade && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "#edfaf4", border: "1px solid #a8e9cb", boxShadow: "0 4px 16px -4px rgb(27 138 90/0.15)" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-[0.08em] mb-2">Note finale officielle</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary-600 tracking-[-0.04em]">{defense.finalGrade}</span>
                    <span className="text-xl text-slate-400">/20</span>
                    <span
                      className="ml-2 text-sm font-bold px-3 py-1 rounded-full"
                      style={{ background: "#d2f4e4", color: "#1B8A5A" }}
                    >
                      {getMentionLabel(defense.finalGrade)}
                    </span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#d2f4e4" }}>
                  <Star className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              {defense.remarks && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #a8e9cb" }}>
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-[0.08em] mb-1">Remarques officielles</p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{defense.remarks}</p>
                </div>
              )}
            </div>
          )}

          {/* Formulaire notation */}
          {showGrade && !hasGrade && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  {isHead ? "Saisir la note finale" : "Soumettre ma note"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GradeForm isFinal={isHead} onSubmit={handleGrade} onCancel={() => setShowGrade(false)} />
              </CardContent>
            </Card>
          )}

          {/* Procès-verbal — PHASE 9 */}
          {(hasGrade || hasMinutes) && isHead && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  Procès-verbal de soutenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasMinutes ? (
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#d2f4e4" }}>
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 tracking-[-0.01em]">PV disponible</p>
                      <p className="text-xs text-slate-500 mt-0.5">Le procès-verbal officiel est prêt à être téléchargé.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={minutesStreamUrl}
                        download={`pv_soutenance_${id}.pdf`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 rounded-lg transition-all"
                        style={{ background: "linear-gradient(135deg, #1B8A5A, #156e48)", boxShadow: "0 4px 8px -2px rgb(27 138 90/0.30)" }}
                      >
                        <Download className="h-3.5 w-3.5" />Télécharger
                      </a>
                      <Button variant="secondary" size="sm" onClick={() => void handleGeneratePV()} disabled={generatingPV}>
                        {generatingPV ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Régénérer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white" style={{ border: "1px solid #E8ECF0" }}>
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700 tracking-[-0.01em]">Générer le procès-verbal officiel</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Le PDF contiendra les informations du jury, les notes individuelles, la note finale et les remarques.
                      </p>
                      {!hasGrade && (
                        <p className="text-xs font-semibold mt-1.5" style={{ color: "#b45309" }}>
                          ⚠ Une note finale doit être saisie avant de générer le PV.
                        </p>
                      )}
                    </div>
                    {hasGrade && (
                      <Button variant="primary" size="sm" onClick={() => void handleGeneratePV()} disabled={generatingPV} className="shrink-0">
                        {generatingPV ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Génération…</> : <><FileText className="h-3.5 w-3.5" />Générer le PV</>}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* PV pour jury/enseignant non-head */}
          {hasMinutes && !isHead && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-primary-600" />
                  </div>
                  Procès-verbal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={minutesStreamUrl}
                  download={`pv_soutenance_${id}.pdf`}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#d2f4e4" }}>
                    <Download className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 tracking-[-0.01em]">Télécharger le procès-verbal</p>
                    <p className="text-xs text-slate-500 mt-0.5">Document officiel au format PDF</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Jury */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-primary-600" />
                  </div>
                  Membres du jury ({defense.jury?.length ?? 0})
                </CardTitle>
                {isHead && (
                  <Button variant="secondary" size="sm" onClick={() => setAssignJuryModal(true)}>
                    {defense.jury?.length ? "Modifier" : "Affecter"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!defense.jury?.length ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}>
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">Aucun membre de jury affecté</p>
                  {isHead && (
                    <Button variant="primary" size="sm" className="mt-3" onClick={() => setAssignJuryModal(true)}>
                      Affecter le jury
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {defense.jury.map((j) => {
                    const firstName = j.teacher?.firstName ?? "Enseignant";
                    const lastName  = j.teacher?.lastName  ?? "";
                    const fullName  = j.teacher ? `${firstName} ${lastName}`.trim() : `Enseignant (${j.teacherId.slice(0, 8)}…)`;
                    const roleCfg   = JURY_ROLE_CFG[j.juryRole] ?? JURY_ROLE_CFG.EXAMINATEUR;

                    return (
                      <div
                        key={j.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl"
                        style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
                      >
                        <Avatar firstName={firstName} lastName={lastName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800 tracking-[-0.02em]">{fullName}</p>
                            {j.juryRole && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                                style={{ background: roleCfg.bg, color: roleCfg.text, borderColor: roleCfg.border }}
                              >
                                {JURY_ROLE_LABEL[j.juryRole] ?? j.juryRole}
                              </span>
                            )}
                          </div>
                          {isJury && j.teacherId === user?.id && j.grade !== null && (
                            <p className="text-xs font-semibold mt-0.5" style={{ color: "#1B8A5A" }}>Ma note : {j.grade}/20</p>
                          )}
                          {(!isJury || j.teacherId !== user?.id) && j.grade !== null && (
                            <p className="text-xs font-semibold mt-0.5" style={{ color: "#1B8A5A" }}>Note soumise : {j.grade}/20</p>
                          )}
                          {j.comment && (
                            <p className="text-xs text-slate-500 mt-0.5 italic line-clamp-1">&quot;{j.comment}&quot;</p>
                          )}
                        </div>
                        {j.grade !== null && (
                          <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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
                  icon:  <Calendar className="h-3.5 w-3.5 text-slate-400" />,
                  value: new Date(defense.scheduledAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
                },
                {
                  label: "Heure",
                  icon:  <Calendar className="h-3.5 w-3.5 text-slate-400" />,
                  value: new Date(defense.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                },
                {
                  label: "Salle",
                  icon:  <MapPin className="h-3.5 w-3.5 text-slate-400" />,
                  value: defense.room ?? "À définir",
                },
                {
                  label: "Planifiée le",
                  icon:  <Shield className="h-3.5 w-3.5 text-slate-400" />,
                  value: formatDate(defense.createdAt),
                },
              ].map((item, i) => (
                <div key={item.label}>
                  {i > 0 && <Separator className="my-0" />}
                  <div className="py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.icon}
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">{item.label}</p>
                    </div>
                    <p className="text-slate-700 pl-5 capitalize font-medium tracking-[-0.01em]">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal jury */}
      <AssignJuryModal
        open={assignJuryModal}
        defenseId={id}
        supervisorId={supervisorId}
        onClose={() => setAssignJuryModal(false)}
        onSubmit={handleAssignJury}
      />
    </div>
  );
}