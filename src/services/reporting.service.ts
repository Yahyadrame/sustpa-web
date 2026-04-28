import api from "@/lib/api";
import type {
  GlobalStats,
  TeacherStats,
  StudentStats,
  ExportRow,
} from "@/types/reporting.types";

export const reportingApi = {
  getGlobalStats: () =>
    api.get<GlobalStats>("/reporting/global").then((r) => r.data),

  getTeacherStats: () =>
    api.get<TeacherStats>("/reporting/teacher").then((r) => r.data),

  getStudentStats: () =>
    api.get<StudentStats>("/reporting/student").then((r) => r.data),

  exportProjects: (filters: {
    academicYear?: string;
    type?: string;
    status?: string;
  }) =>
    api
      .get<ExportRow[]>("/reporting/export", { params: filters })
      .then((r) => r.data),
};
