"use client";

import { TrendingUp } from "lucide-react";
import { useReporting } from "@/hooks/use-reporting";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsibleDashboard } from "@/components/dashboard/responsible-dashboard";
import { ExportPanel } from "@/components/reporting/export-panel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const { globalStats, loading } = useReporting(user?.role);

  // Guard : cette page est réservée au RESPONSIBLE et à l'ADMIN
  if (!user || !["RESPONSIBLE", "ADMIN"].includes(user.role)) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rapports & Statistiques"
        description="Vue globale et exports des données académiques"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Rapports" },
        ]}
        actions={
          <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
        }
      />

      {/* Récapitulatif chiffres clés */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
      ) : (
        globalStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Projets",
                value: globalStats.overview.totalProjects,
                color: "text-primary-600",
                bg: "bg-primary-50",
              },
              {
                label: "Étudiants",
                value: globalStats.overview.totalStudents,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Livrables",
                value: globalStats.overview.totalDeliveries,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Taux validation",
                value: `${globalStats.overview.validationRate}%`,
                color: "text-green-600",
                bg: "bg-green-50",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`card ${item.bg} border-0 space-y-1`}
              >
                <p className="text-xs font-medium text-slate-500">
                  {item.label}
                </p>
                <p className={`text-2xl font-black ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )
      )}

      {/* Dashboard statistiques complet */}
      <ResponsibleDashboard stats={globalStats} loading={loading} />

      {/* Séparateur visuel */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
          Export des données
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Panel d'export */}
      <ExportPanel />

      {/* Note informative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Données incluses dans les exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-700">
                Chaque ligne contient :
              </p>
              <ul className="space-y-1 text-slate-500">
                <li>• Titre du projet</li>
                <li>• Type (PFE / Mémoire / Thèse)</li>
                <li>• Statut courant</li>
                <li>• Année académique</li>
              </ul>
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-700">
                Informations étudiant :
              </p>
              <ul className="space-y-1 text-slate-500">
                <li>• Prénom et nom</li>
                <li>• Email institutionnel</li>
                <li>• Date de création du projet</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
