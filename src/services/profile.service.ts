import api from "@/lib/api";
import type { UserProfile } from "@/types/profile.types";

export const profileApi = {
  getMyProfile: () => api.get<UserProfile>("/profile").then((r) => r.data),

  // CORRECTION BUG 6+7 : noms de champs alignés sur le schema DB réel
  // filiere (pas field), specialite (pas specialty)
  // department et promotion supprimés — colonnes inexistantes en DB
  // maxProjects en number (pas string)
  updateMyProfile: (
    data: Partial<{
      firstName: string;
      lastName: string;
      // Étudiant
      level: string;
      filiere: string; // CORRECTION : filiere (pas field)
      // Enseignant
      grade: string;
      specialite: string; // CORRECTION : specialite (pas specialty)
      maxProjects: number; // CORRECTION : number (pas string)
    }>,
  ) => api.patch<UserProfile>("/profile", data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api
      .post<{ avatarUrl: string }>("/profile/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  removeAvatar: () => api.delete("/profile/avatar").then((r) => r.data),
};
