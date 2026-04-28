"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/services/admin.service";
import { useToast } from "@/components/ui/toast";
// CORRECTION 1 : AuditLog retiré — importé mais jamais utilisé dans ce fichier
import type { AdminStats, AuditLogsResponse } from "@/types/admin.types";
import type { AppRole } from "@/types/auth.types";

// ─── Hook stats admin ───────────────────────────────────────────────────────
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CORRECTION 2 : void explicite pour éviter l'erreur
    // "Expected an assignment or function call" (@typescript-eslint/no-floating-promises)
    void adminApi
      .getStats()
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques"))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}

// ─── Hook audit logs ────────────────────────────────────────────────────────
export function useAuditLogs(initialPage = 1) {
  const [result, setResult] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(p, 50);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLogs(page);
  }, [page, fetchLogs]);

  return {
    logs: result?.data ?? [],
    total: result?.total ?? 0,
    page,
    setPage,
    loading,
    refetch: () => void fetchLogs(page),
  };
}

// ─── Hook actions admin ─────────────────────────────────────────────────────
export function useAdminActions() {
  const toast = useToast();

  const changeRole = async (
    userId: string,
    role: AppRole,
    onSuccess?: () => void,
  ) => {
    try {
      await adminApi.changeRole(userId, role);
      toast.success("Rôle mis à jour avec succès");
      onSuccess?.();
    } catch {
      toast.error("Impossible de changer le rôle");
    }
  };

  const forceResetPassword = async (userId: string, onSuccess?: () => void) => {
    try {
      await adminApi.forceResetPassword(userId);
      toast.success("Réinitialisation forcée. Email envoyé à l'utilisateur.");
      onSuccess?.();
    } catch {
      toast.error("Impossible de forcer la réinitialisation");
    }
  };

  const bulkActivate = async (ids: string[], onSuccess?: () => void) => {
    try {
      const r = await adminApi.bulkAction({ userIds: ids, action: "ACTIVATE" });
      toast.success(r.message);
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de l'activation");
    }
  };

  const bulkDeactivate = async (ids: string[], onSuccess?: () => void) => {
    try {
      const r = await adminApi.bulkAction({
        userIds: ids,
        action: "DEACTIVATE",
      });
      toast.success(r.message);
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de la désactivation");
    }
  };

  const bulkSendEmail = async (
    ids: string[],
    subject: string,
    message: string,
    onSuccess?: () => void,
  ) => {
    try {
      const r = await adminApi.bulkAction({
        userIds: ids,
        action: "SEND_EMAIL",
        subject,
        message,
      });
      toast.success(r.message);
      onSuccess?.();
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const exportCSV = (
    users: Array<Record<string, unknown>>,
    filename = "users",
  ) => {
    if (!users.length) return;
    const headers = Object.keys(users[0]);
    const rows = users.map((u) =>
      headers.map((h) => `"${u[h] ?? ""}"`).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  return {
    changeRole,
    forceResetPassword,
    bulkActivate,
    bulkDeactivate,
    bulkSendEmail,
    exportCSV,
  };
}
