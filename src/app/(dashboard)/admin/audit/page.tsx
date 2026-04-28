"use client";

import { useState } from "react";
import { ClipboardList, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { useAuditLogs } from "@/hooks/use-admin";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthStore } from "@/store/auth.store";

const ACTION_FILTERS = [
  { value: "", label: "Toutes les actions" },
  { value: "PROJECT", label: "Projets" },
  { value: "DELIVERABLE", label: "Livrables" },
  { value: "ROLE", label: "Modifications rôles" },
  { value: "BULK", label: "Actions en masse" },
  { value: "PASSWORD", label: "Mots de passe" },
  { value: "APPLICATION", label: "Candidatures" },
];

export default function AuditPage() {
  const user = useAuthStore((s) => s.user);
  const { logs, total, page, setPage, loading } = useAuditLogs();
  const [filterAction, setFilterAction] = useState("");
  const [search, setSearch] = useState("");

  if (!user || user.role !== "ADMIN") return null;

  const totalPages = Math.ceil(total / 50);

  // Filtrage local (les logs sont déjà paginés côté serveur)
  const filtered = logs.filter((l) => {
    const matchAction = !filterAction || l.action.startsWith(filterAction);
    const matchSearch =
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.actor?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Journal d'audit"
        description={`${total} entrée${total > 1 ? "s" : ""} — toutes les actions du système`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Audit" },
        ]}
      />

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Action, email, entité…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterAction(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterAction === f.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-slate-600 border-border hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm text-slate-500">
            Page {page} / {totalPages || 1} — {filtered.length} entrée
            {filtered.length > 1 ? "s" : ""} affichée
            {filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        {filtered.length === 0 && !loading ? (
          <div className="py-8">
            <EmptyState
              icon={<ClipboardList className="h-8 w-8" />}
              title="Aucune entrée trouvée"
              description="Modifiez vos filtres ou attendez de nouvelles actions."
              size="sm"
            />
          </div>
        ) : (
          <div className="px-2 py-2">
            <AuditLogTable logs={filtered} loading={loading} />
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <span className="text-xs text-slate-500">
              Page {page} sur {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
