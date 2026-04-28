import api from "@/lib/api";
import type { MeetSession } from "@/types/meet.types";

export const meetApi = {
  getAll: () => api.get<MeetSession[]>("/meet").then((r) => r.data),

  getById: (id: string) =>
    api.get<MeetSession>(`/meet/${id}`).then((r) => r.data),

  create: (data: {
    projectId: string;
    studentId: string;
    title: string;
    agenda?: string;
    scheduledAt: string;
    durationMin: number;
  }) => api.post<MeetSession>("/meet", data).then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      title: string;
      agenda: string;
      scheduledAt: string;
      durationMin: number;
      report: string;
      isConfirmed: boolean;
    }>,
  ) => api.patch<MeetSession>(`/meet/${id}`, data).then((r) => r.data),

  confirm: (id: string) => api.patch(`/meet/${id}/confirm`).then((r) => r.data),

  submitReport: (id: string, report: string) =>
    api.patch(`/meet/${id}/report`, { report }).then((r) => r.data),

  delete: (id: string) => api.delete(`/meet/${id}`).then((r) => r.data),
};
