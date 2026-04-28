import api from "@/lib/api";
import type {
  Deliverable,
  DeliverableReview,
  AuditEntry,
} from "@/types/deliverable.types";

export const deliverablesApi = {
  getAll: () => api.get<Deliverable[]>("/deliverables").then((r) => r.data),

  getById: (id: string) =>
    api.get<Deliverable>(`/deliverables/${id}`).then((r) => r.data),

  getVersions: (projectId: string, milestoneId: string) =>
    api
      .get<
        Deliverable[]
      >(`/deliverables/project/${projectId}/milestone/${milestoneId}/versions`)
      .then((r) => r.data),

  // Upload multipart/form-data
  upload: (
    file: File,
    milestoneId: string,
    projectId: string,
    title: string,
  ) => {
    const form = new FormData();
    form.append("file", file);
    form.append("milestoneId", milestoneId);
    form.append("projectId", projectId);
    form.append("title", title);
    return api
      .post<Deliverable>("/deliverables", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  review: (
    id: string,
    status: "APPROVED" | "REVISION_REQUESTED",
    comment?: string,
  ) =>
    api
      .patch(`/deliverables/${id}/review`, { status, comment })
      .then((r) => r.data),

  addComment: (id: string, comment: string) =>
    api
      .post<DeliverableReview>(`/deliverables/${id}/comments`, { comment })
      .then((r) => r.data),

  getAuditLog: (id: string) =>
    api.get<AuditEntry[]>(`/deliverables/${id}/audit`).then((r) => r.data),
};
