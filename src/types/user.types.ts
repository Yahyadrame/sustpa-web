import type { AppRole } from "./auth.types";

export type AcademicLevel =
  | "LICENCE_1"
  | "LICENCE_2"
  | "LICENCE_3"
  | "MASTER_1"
  | "MASTER_2"
  | "DOCTORAT";

export type TeacherGrade =
  | "ASSISTANT"
  | "MAITRE_ASSISTANT"
  | "MAITRE_CONF"
  | "PROFESSEUR";

export interface StudentProfile {
  id: string;
  userId: string;
  matricule: string;
  level: AcademicLevel;
  field: string; // CORRECTION: field (pas filiere)
}

export interface TeacherProfile {
  id: string;
  userId: string;
  grade: TeacherGrade;
  specialty: string; // CORRECTION: specialty (pas specialite)
  maxProjects: number;
  responsibleLevel?: "LICENCE" | "MASTER" | "DOCTORAL";
}

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  isFirstLogin: boolean;
  avatarUrl: string | null;
  createdAt: string;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
}
