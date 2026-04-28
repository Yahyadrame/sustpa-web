"use client";

import { useReporting } from "@/hooks/use-reporting";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/ui/page-header";
import { ResponsibleDashboard } from "@/components/dashboard/responsible-dashboard";

export default function HeadPage() {
  const user = useAuthStore((s) => s.user);
  const { globalStats, loading } = useReporting(user?.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tableau de bord — Responsable"
        description="Supervision globale et gestion des projets académiques"
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }]}
      />
      <ResponsibleDashboard stats={globalStats} loading={loading} />
    </div>
  );
}
