import type { AppRole } from "./auth.types";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  avatarUrl: string | null;
  isFirstLogin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: StudentProfileData | TeacherProfileData | Record<string, never>;
}

export interface StudentProfileData {
  id: string;
  userId: string;
  matricule: string;
  level: string;
  field: string; // CORRECTION: field (pas filiere)
}

export interface TeacherProfileData {
  id: string;
  userId: string;
  grade: string;
  specialty: string; // CORRECTION: specialty (pas specialite)
  maxProjects: number;
  responsibleLevel?: string;
}

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "blue" | "indigo" | "violet" | "emerald" | "amber";
export type FontSize = "sm" | "md" | "lg";

export interface AppSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  notifEmail: boolean;
  notifInApp: boolean;
  notifDeadline: boolean;
  notifValidation: boolean;
  notifMeet: boolean;
  language: "fr" | "en";
  compactMode: boolean;
}
