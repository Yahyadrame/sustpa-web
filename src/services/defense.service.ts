import api from "@/lib/api";
import type { Defense, AssignJuryPayload } from "@/types/defense.types";

export const defenseApi = {
  // ─── Lister les soutenances ──────────────────────────────────────────────
  getAll: () => api.get<Defense[]>("/defense").then((r) => r.data),

  // ─── Détail d'une soutenance ─────────────────────────────────────────────
  getById: (id: string) =>
    api.get<Defense>(`/defense/${id}`).then((r) => r.data),

  // ─── Créer une soutenance ────────────────────────────────────────────────
  create: (data: { projectId: string; scheduledAt: string; room: string }) =>
    api.post<Defense>("/defense", data).then((r) => r.data),

  // ─── Affecter le jury ────────────────────────────────────────────────────
  assignJury: (id: string, payload: AssignJuryPayload) =>
    api.patch(`/defense/${id}/jury`, payload).then((r) => r.data),

  // ─── Saisir une note (membre jury ou RESPONSIBLE) ────────────────────────
  grade: (
    id: string,
    data: { grade: number; remarks?: string; comment?: string },
  ) => api.patch(`/defense/${id}/grade`, data).then((r) => r.data),

  // ─── Archiver ────────────────────────────────────────────────────────────
  archive: (id: string) =>
    api.patch(`/defense/${id}/archive`).then((r) => r.data),

  // ─── Phase 9 : Générer le procès-verbal PDF ───────────────────────────────
  // POST /defense/:id/minutes
  // Pré-requis : note finale saisie
  // Génère le PDF côté serveur, l'uploade sur Cloudinary et stocke l'URL
  generateMinutes: (id: string) =>
    api.post<{ message: string }>(`/defense/${id}/minutes`).then((r) => r.data),

  // ─── Phase 9 : URL de stream du PV PDF ───────────────────────────────────
  // Construit l'URL de streaming sécurisé via le proxy Next.js
  // Jamais d'URL Cloudinary directe côté navigateur
  getMinutesStreamUrl: (id: string): string =>
    `/api/v1/defense/${id}/minutes/stream`,
};
