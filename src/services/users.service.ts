import api from "@/lib/api";
import type { UserDetail } from "@/types/user.types";

export const usersApi = {
  getAll: (search?: string) =>
    api
      .get<UserDetail[]>("/users", { params: search ? { search } : {} })
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<UserDetail>(`/users/${id}`).then((r) => r.data),

  getMe: () => api.get<UserDetail>("/users/me").then((r) => r.data),

  create: (data: Record<string, unknown>) =>
    api.post<UserDetail>("/users", data).then((r) => r.data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<UserDetail>(`/users/${id}`, data).then((r) => r.data),

  getTeachers: () =>
    api.get<UserDetail[]>("/users/teachers").then((r) => r.data),
};
