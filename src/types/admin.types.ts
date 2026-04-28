import type { AppRole } from "./auth.types";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalDeptHeads: number;
  totalJury: number;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: AppRole;
    createdAt: string;
  }>;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
  actor: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export type BulkAction =
  | "ACTIVATE"
  | "DEACTIVATE"
  | "EXPORT_CSV"
  | "SEND_EMAIL";

export interface BulkActionPayload {
  userIds: string[];
  action: BulkAction;
  subject?: string;
  message?: string;
}
