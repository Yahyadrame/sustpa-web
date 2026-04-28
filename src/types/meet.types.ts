export interface MeetSession {
  id: string;
  projectId: string;
  supervisorId: string;
  studentId: string;
  title: string;
  agenda: string | null;
  meetingLink: string;
  scheduledAt: string;
  // ✅ CORRIGÉ — number (cohérent avec meetApi.create et le service NestJS)
  durationMin: number;
  isConfirmed: boolean;
  report: string | null;
  archivedAt: string | null;
  createdAt: string;
}
