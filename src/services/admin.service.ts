import api from "@/lib/api";
import type {
  AdminStats,
  AuditLogsResponse,
  BulkActionPayload,
} from "@/types/admin.types";
import type { AppRole } from "@/types/auth.types";

export const adminApi = {
  // Stats dashboard
  getStats: () => api.get<AdminStats>("/admin/stats").then((r) => r.data),

  // Audit log
  getAuditLogs: (page = 1, limit = 50) =>
    api
      .get<AuditLogsResponse>("/admin/audit", { params: { page, limit } })
      .then((r) => r.data),

  // Changer le rôle
  changeRole: (userId: string, role: AppRole) =>
    api.patch(`/admin/users/${userId}/role`, { role }).then((r) => r.data),

  // Forcer reset password
  forceResetPassword: (userId: string) =>
    api.post(`/admin/users/${userId}/reset-password`).then((r) => r.data),

  // Actions en masse
  bulkAction: (payload: BulkActionPayload) =>
    api.post("/admin/bulk", payload).then((r) => r.data),
};
