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
  const [statusFilter, setStatusFilter] = useState<"TOUS" | "DISPONIBLE" | "CLOTURE">("TOUS");
  const [currentPage, setCurrentPage] = useState(1);
  const [applyModal, setApplyModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: "", title: "",
  });
  const [message, setMessage] = useState("");

  const ITEMS_PER_PAGE = 5;

  const filtered = (subjects as unknown as SubjectWithApplication[]).filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchType   = !typeFilter || s.type === typeFilter;
    const matchStatus = 
      statusFilter === "TOUS" ? true :
      statusFilter === "DISPONIBLE" ? s.isAvailable :
      statusFilter === "CLOTURE" ? s.validationStatus === "CLOSED" : true;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
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
            />
          </div>

          <div className="flex items-center gap-1.5">
            {["", "PFE", "MEMOIRE", "THESE"].map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  typeFilter === t
                    ? { background: "linear-gradient(135deg, #1B8A5A, #156e48)", color: "#fff" }
                    : { background: "#F6F8FA", border: "1px solid #E8ECF0", color: "#64748b" }
                }
              >
                {t === "" ? "Tous types" : t === "MEMOIRE" ? "Mémoire" : t === "THESE" ? "Thèse" : t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(["TOUS", "DISPONIBLE", "CLOTURE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                statusFilter === s
                  ? { background: "#1B8A5A", color: "#fff" }
                  : { background: "#F6F8FA", border: "1px solid #E8ECF0", color: "#64748b" }
              }
            >
              {s === "TOUS" ? "Tous" : s === "DISPONIBLE" ? "Disponible" : "Clôturé"}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E8ECF0] bg-white">
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="Aucun sujet trouvé"
            description="Essayez de changer vos filtres."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((subject) => {
            const isAvailable = subject.validationStatus === "VALIDATED" && subject.isAvailable;
            const appStatus   = subject.myApplicationStatus ?? null;
            const appCfg      = appStatus ? APP_CFG[appStatus] : null;
            const typeCfg     = TYPE_CFG[subject.type] ?? { bg: "#F6F8FA", text: "#64748b", border: "#E8ECF0", label: subject.type };
            const stsCfg      = STATUS_CFG[subject.validationStatus] ?? STATUS_CFG.CLOSED;

            return (
              <div
                key={subject.id}
                className="flex items-center justify-between p-5 rounded-2xl bg-white border border-[#E8ECF0] transition-all duration-200 hover:border-primary-500 hover:shadow-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold"
                      style={{ background: typeCfg.bg, color: typeCfg.text, border: `1px solid ${typeCfg.border}` }}>
                      {typeCfg.label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold"
                      style={{ background: stsCfg.bg, color: stsCfg.text, border: `1px solid ${stsCfg.border}` }}>
                      {stsCfg.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{subject.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{subject.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/subjects/${subject.id}`}>
                    <Button variant="secondary" size="sm">Voir</Button>
                  </Link>
                  {canApply && isAvailable && !appStatus && (
                    <Button variant="primary" size="sm" onClick={() => setApplyModal({ open: true, id: subject.id, title: subject.title })}>
                      Postuler
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-8">
          <Button 
            variant="secondary" 
            size="sm"
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Précédent
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            // Affiche toujours première, dernière, et les pages proches de la courante
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    currentPage === page 
                      ? "bg-primary-600 text-white shadow-sm" 
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2 text-slate-400">...</span>;
            }
            return null;
          })}

          <Button 
            variant="secondary" 
            size="sm"
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Suivant
          </Button>
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