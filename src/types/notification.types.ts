export type NotificationType = "DEADLINE" | "VALIDATION" | "MEET" | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}
