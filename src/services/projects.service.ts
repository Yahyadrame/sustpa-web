import api from "@/lib/api";
import type {
  Project,
  ProjectSubject,
  PendingSubjectItem,
  SubjectApplication,
  Milestone,
  ValidateSubjectPayload,
} from "@/types/project.types";

export const projectsApi = {
  // ─── Projets ─────────────────────────────────────────────────────────────
  getAll: () => api.get<Project[]>("/projects").then((r) => r.data),

  getById: (id: string) =>
    api.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (data: {
    title: string;
    description: string;
    type: string;
    academicYear: string;
  }) => api.post<Project>("/projects", data).then((r) => r.data),

  approve: (id: string) =>
    api.patch(`/projects/${id}/approve`).then((r) => r.data),

  reject: (id: string, reason: string) =>
    api.patch(`/projects/${id}/reject`, { reason }).then((r) => r.data),

  assignSupervisor: (id: string, supervisorId: string) =>
    api
      .patch(`/projects/${id}/assign-supervisor`, { supervisorId })
      .then((r) => r.data),

  archive: (id: string) =>
    api.patch(`/projects/${id}/archive`).then((r) => r.data),

  // ─── Jalons ──────────────────────────────────────────────────────────────
  getMilestones: (projectId: string) =>
    api
      .get<Milestone[]>(`/projects/${projectId}/milestones`)
      .then((r) => r.data),

  createMilestone: (
    projectId: string,
    data: {
      title: string;
      dueDate: string;
      order: number;
      description?: string;
      isFinal?: boolean;
    },
  ) =>
    api
      .post<Milestone>(`/projects/${projectId}/milestones`, data)
      .then((r) => r.data),

  setMilestoneFinal: (projectId: string, milestoneId: string) =>
    api
      .patch<Milestone>(
        `/projects/${projectId}/milestones/${milestoneId}/set-final`,
      )
      .then((r) => r.data),

  // ─── Sujets ──────────────────────────────────────────────────────────────
  getAllSubjects: () =>
    api.get<ProjectSubject[]>("/projects/subjects/all").then((r) => r.data),

  getSubjectById: (id: string) =>
    api.get<ProjectSubject>(`/projects/subjects/${id}`).then((r) => r.data),

  // CORRECTION : supervisorId ajouté dans la signature
  // Obligatoire pour les étudiants, ignoré côté service pour les enseignants
  createSubject: (data: {
    title: string;
    description: string;
    type: string;
    supervisorId?: string;
  }) =>
    api.post<ProjectSubject>("/projects/subjects", data).then((r) => r.data),

  getPendingSubjects: () =>
    api
      .get<PendingSubjectItem[]>("/projects/subjects/pending")
      .then((r) => r.data),

  validateSubject: (id: string, payload: ValidateSubjectPayload) =>
    api
      .patch<{ message: string }>(`/projects/subjects/${id}/validate`, payload)
      .then((r) => r.data),

  // ─── Candidatures ────────────────────────────────────────────────────────
  apply: (subjectId: string, message?: string) =>
    api
      .post<SubjectApplication>("/projects/applications/apply", {
        subjectId,
        message,
      })
      .then((r) => r.data),

  getMyApplications: () =>
    api
      .get<SubjectApplication[]>("/projects/applications/mine")
      .then((r) => r.data),

  reviewApplication: (id: string, status: "ACCEPTED" | "REJECTED") =>
    api
      .patch(`/projects/applications/${id}/review`, { status })
      .then((r) => r.data),
};
