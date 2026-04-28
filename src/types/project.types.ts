export type ProjectType = "PFE" | "MEMOIRE" | "THESE";

export type ProjectStatus =
  | "PROPOSITION"
  | "EN_COURS"
  | "SOUMIS"
  | "SOUTENU"
  | "ARCHIVE";

export type MilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "OVERDUE";

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type SubjectStatus =
  | "PENDING_VALIDATION"
  | "VALIDATED"
  | "REJECTED"
  | "CLOSED";

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  studentId: string;
  supervisorId: string | null;
  rejectionReason: string | null;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: MilestoneStatus;
  order: number;
  // ✅ NOUVEAU — jalon désigné comme jalon de rendu final par l'encadrant
  isFinal: boolean;
}

export interface ProjectSubject {
  id: string;
  supervisorId: string;
  proposedByStudentId: string | null;
  title: string;
  description: string;
  type: ProjectType;
  validationStatus: SubjectStatus;
  isAvailable: boolean;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  applications?: SubjectApplication[];
}

export interface PendingSubjectItem {
  subject: ProjectSubject;
  proposedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface SubjectApplication {
  id: string;
  subjectId: string;
  studentId: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ValidateSubjectPayload {
  action: "APPROVE" | "REJECT";
  reason?: string;
  supervisorId?: string;
}
