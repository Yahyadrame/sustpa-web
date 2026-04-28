"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Search, BookOpen, Send, Eye,
  Clock, CheckCircle2, XCircle, Filter,
} from "lucide-react";

import { useSubjects }  from "@/hooks/use-subjects";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader }   from "@/components/ui/page-header";
import { Button }       from "@/components/ui/button";
import { EmptyState }   from "@/components/ui/empty-state";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Skeleton }     from "@/components/ui/skeleton";
import { cn }           from "@/lib/utils";

/* ── Config visuels ─────────────────────────────────────────── */
const TYPE_CFG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PFE:     { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "PFE"     },
  MEMOIRE: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", label: "Mémoire" },
  THESE:   { bg: "#fffbeb", text: "#b45309", border: "#fde68a", label: "Thèse"   },
};

const STATUS_CFG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING_VALIDATION: { bg: "#fffbeb", text: "#b45309", border: "#fde68a", label: "En attente"  },
  VALIDATED:          { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb", label: "Disponible"  },
  REJECTED:           { bg: "#fff1f2", text: "#dc2626", border: "#fecaca", label: "Refusé"      },
  CLOSED:             { bg: "#F6F8FA", text: "#64748b", border: "#E8ECF0", label: "Clôturé"     },
};

const APP_CFG: Record<"PENDING" | "ACCEPTED" | "REJECTED", {
  bg: string; text: string; border: string; label: string; icon: React.ReactNode;
}> = {
  PENDING:  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", label: "Candidature envoyée",  icon: <Clock        className="h-3 w-3" /> },
  ACCEPTED: { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb", label: "Candidature acceptée", icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED: { bg: "#fff1f2", text: "#dc2626", border: "#fecaca", label: "Candidature refusée",  icon: <XCircle      className="h-3 w-3" /> },
};

interface SubjectWithApplication {
  id: string;
  title: string;
  description: string;
  type: string;
  validationStatus: string;
  isAvailable: boolean;
  myApplicationStatus?: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}

export default function SubjectsPage() {
  const user = useAuthStore((s) => s.user);
  const { subjects, loading, applyToSubject } = useSubjects();

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [applyModal, setApplyModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: "", title: "",
  });
  const [message, setMessage] = useState("");

  const filtered = (subjects as unknown as SubjectWithApplication[]).filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = !typeFilter || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const canCreate = ["TEACHER", "RESPONSIBLE"].includes(user?.role ?? "");
  const canApply  = user?.role === "STUDENT";

  const handleApply = async () => {
    await applyToSubject(applyModal.id, message || undefined);
    setApplyModal({ open: false, id: "", title: "" });
    setMessage("");
  };

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      <PageHeader
        title="Bibliothèque de sujets"
        description={`${subjects.length} sujet${subjects.length > 1 ? "s" : ""} disponible${subjects.length > 1 ? "s" : ""}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sujets" },
        ]}
        actions={
          canCreate && (
            <Link href="/subjects/new">
              <Button variant="primary" size="md">
                <Plus className="h-4 w-4" />
                Proposer un sujet
              </Button>
            </Link>
          )
        }
      />

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div
          className="relative flex-1 max-w-sm flex items-center rounded-xl"
          style={{ background: "#F6F8FA", border: "1.5px solid #E8ECF0" }}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Rechercher un sujet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-sans tracking-[-0.01em]"
            onFocus={(e) => {
              e.currentTarget.parentElement!.style.borderColor = "#1B8A5A";
              e.currentTarget.parentElement!.style.boxShadow = "0 0 0 3px rgb(27 138 90/0.10)";
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.borderColor = "#E8ECF0";
              e.currentTarget.parentElement!.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Chips type */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-slate-400 mr-0.5 shrink-0" />
          {["", "PFE", "MEMOIRE", "THESE"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                typeFilter === t
                  ? { background: "linear-gradient(135deg, #1B8A5A, #156e48)", color: "#fff" }
                  : { background: "#F6F8FA", border: "1px solid #E8ECF0", color: "#64748b" }
              }
            >
              {t === "" ? "Tous" : t === "MEMOIRE" ? "Mémoire" : t === "THESE" ? "Thèse" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#E8ECF0] bg-white p-5 space-y-3">
              <div className="flex gap-2"><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-3/5" />
              <div className="pt-3 border-t border-[#E8ECF0]"><Skeleton className="h-9 w-full rounded-xl" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E8ECF0] bg-white">
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="Aucun sujet trouvé"
            description="Aucun sujet disponible pour le moment."
            action={canCreate ? (
              <Link href="/subjects/new"><Button variant="primary" size="sm"><Plus className="h-4 w-4" />Proposer un sujet</Button></Link>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((subject) => {
            const isAvailable = subject.validationStatus === "VALIDATED" && subject.isAvailable;
            const appStatus   = subject.myApplicationStatus ?? null;
            const appCfg      = appStatus ? APP_CFG[appStatus] : null;
            const typeCfg     = TYPE_CFG[subject.type] ?? { bg: "#F6F8FA", text: "#64748b", border: "#E8ECF0", label: subject.type };
            const stsCfg      = STATUS_CFG[subject.validationStatus] ?? STATUS_CFG.CLOSED;

            return (
              <div
                key={subject.id}
                className="flex flex-col rounded-2xl bg-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ border: "1px solid #E8ECF0", boxShadow: "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a8e9cb";
                  e.currentTarget.style.boxShadow = "0 0 0 1px rgb(27 138 90/0.08), 0 8px 20px -4px rgb(0 0 0/0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E8ECF0";
                  e.currentTarget.style.boxShadow = "0 0 0 1px rgb(0 0 0/0.03), 0 2px 6px 0 rgb(0 0 0/0.05)";
                }}
              >
                <div className="p-5 space-y-3 flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold"
                      style={{ background: typeCfg.bg, color: typeCfg.text, border: `1px solid ${typeCfg.border}` }}>
                      {typeCfg.label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold"
                      style={{ background: stsCfg.bg, color: stsCfg.text, border: `1px solid ${stsCfg.border}` }}>
                      {stsCfg.label}
                    </span>
                    {canApply && appCfg && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold"
                        style={{ background: appCfg.bg, color: appCfg.text, border: `1px solid ${appCfg.border}` }}>
                        {appCfg.icon}{appCfg.label}
                      </span>
                    )}
                  </div>

                  <Link href={`/subjects/${subject.id}`}>
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-primary-700 transition-colors cursor-pointer tracking-[-0.02em]">
                      {subject.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {subject.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderTop: "1px solid #E8ECF0" }}>
                  <Link href={`/subjects/${subject.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="h-3.5 w-3.5" />Voir le détail
                    </Button>
                  </Link>
                  {canApply && isAvailable && !appStatus && (
                    <Button variant="primary" size="sm"
                      onClick={() => setApplyModal({ open: true, id: subject.id, title: subject.title })}>
                      <Send className="h-3.5 w-3.5" />Postuler
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal candidature */}
      <Dialog
        open={applyModal.open}
        onClose={() => { setApplyModal({ open: false, id: "", title: "" }); setMessage(""); }}
        title={`Postuler — ${applyModal.title}`}
        description="Vous pouvez ajouter un message de motivation (optionnel)."
        size="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
              Message de motivation <span className="text-xs text-slate-400">(optionnel)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Expliquez pourquoi ce sujet vous intéresse…"
              className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setApplyModal({ open: false, id: "", title: "" })}>
              Annuler
            </Button>
            <Button onClick={handleApply}>
              <Send className="h-4 w-4" />Envoyer la candidature
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}