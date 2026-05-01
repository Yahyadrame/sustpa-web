import api from "@/lib/api";
import type { UserProfile } from "@/types/profile.types";

export const profileApi = {
  getMyProfile: () => api.get<UserProfile>("/profile").then((r) => r.data),

  // CORRECTION: field (pas filiere), specialty (pas specialite)
  updateMyProfile: (
    data: Partial<{
      firstName: string;
      lastName: string;
      // Étudiant
      level: string;
      field: string; // CORRECTION: field (pas filiere)
      // Enseignant
      grade: string;
      specialty: string; // CORRECTION: specialty (pas specialite)
      maxProjects: number;
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
