import api from "@/lib/api";
import type { Notification } from "@/types/notification.types";

export const notificationsApi = {
  getAll: () => api.get<Notification[]>("/notifications").then((r) => r.data),

  getUnreadCount: () =>
    api
      .get<{ count: number }>("/notifications/unread-count")
      .then((r) => r.data.count),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () => api.patch("/notifications/read-all").then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};
