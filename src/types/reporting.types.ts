export interface GlobalStats {
  overview: {
    totalProjects: number;
    totalStudents: number;
    totalTeachers: number;
    totalDeliveries: number;
    totalSessions: number;
    totalDefenses: number;
    validationRate: number;
  };
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  deliverables: Array<{ status: string; count: number }>;
}

export interface TeacherStats {
  totalProjects: number;
  projectsByStatus: { EN_COURS: number; SOUMIS: number; SOUTENU: number };
  pendingDeliverables: number;
  totalSessions: number;
  recentProjects: unknown[];
}

export interface StudentStats {
  activeProject: unknown | null;
  totalProjects: number;
  totalDeliverables: number;
  deliverablesByStatus: {
    PENDING: number;
    APPROVED: number;
    REVISION_REQUESTED: number;
  };
  milestoneProgress: { total: number; completed: number; overdue: number };
  upcomingSessions: unknown[];
  recentDeliverables: unknown[];
}

export interface ExportRow {
  id: string;
  title: string;
  type: string;
  status: string;
  academicYear: string;
  createdAt: string;
  studentName: string | null;
  studentLastName: string | null;
  studentEmail: string | null;
}
