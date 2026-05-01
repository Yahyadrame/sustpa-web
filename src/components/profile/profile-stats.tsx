"use client";

import { GraduationCap, BookOpen, Calendar, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  UserProfile,
  StudentProfileData,
  TeacherProfileData,
} from "@/types/profile.types";

// Type guards
const isStudentProfile = (profile: unknown): profile is StudentProfileData => {
  return (
    typeof profile === "object" &&
    profile !== null &&
    "matricule" in profile &&
    "level" in profile
  );
};

const isTeacherProfile = (profile: unknown): profile is TeacherProfileData => {
  return (
    typeof profile === "object" &&
    profile !== null &&
    "grade" in profile &&
    "specialty" in profile
  );
};

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Étudiant",
  TEACHER: "Enseignant",
  RESPONSIBLE: "Responsable de filière",
  JURY_MEMBER: "Membre du jury",
  ADMIN: "Administrateur",
};

const ROLE_VARIANTS: Record<
  string,
  "default" | "primary" | "accent" | "warning" | "danger"
> = {
  ADMIN: "danger",
  STUDENT: "primary",
  TEACHER: "accent",
  RESPONSIBLE: "warning",
  JURY_MEMBER: "default",
};

const LEVEL_LABELS: Record<string, string> = {
  LICENCE_1: "Licence 1",
  LICENCE_2: "Licence 2",
  LICENCE_3: "Licence 3",
  MASTER_1: "Master 1",
  MASTER_2: "Master 2",
  DOCTORAT: "Doctorat",
};

const GRADE_LABELS: Record<string, string> = {
  ASSISTANT: "Assistant",
  MAITRE_ASSISTANT: "Maître Assistant",
  MAITRE_CONF: "Maître Conférences",
  PROFESSEUR: "Professeur",
};

const RESPONSIBLE_LEVEL_LABELS: Record<string, string> = {
  LICENCE: "Licence",
  MASTER: "Master",
  DOCTORAL: "Doctorat",
};

interface ProfileStatsProps {
  profile: UserProfile;
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const isStudent = profile.role === "STUDENT";
  const isTeacher = ["TEACHER", "RESPONSIBLE"].includes(profile.role);

  const studentProfile = isStudentProfile(profile.profile)
    ? profile.profile
    : null;
  const teacherProfile = isTeacherProfile(profile.profile)
    ? profile.profile
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <span>Informations</span>
          <Badge variant={ROLE_VARIANTS[profile.role] ?? "default"} dot>
            {ROLE_LABELS[profile.role] ?? profile.role}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <StatRow
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Membre depuis"
          value={new Date(profile.createdAt).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        />

        {/* Infos étudiant */}
        {isStudent && studentProfile && (
          <>
            {studentProfile.matricule && (
              <StatRow
                icon={<Shield className="h-3.5 w-3.5" />}
                label="Matricule"
                value={studentProfile.matricule}
              />
            )}
            {studentProfile.level && (
              <StatRow
                icon={<GraduationCap className="h-3.5 w-3.5" />}
                label="Niveau"
                value={
                  LEVEL_LABELS[studentProfile.level] ?? studentProfile.level
                }
              />
            )}
            {studentProfile.field && (
              <StatRow
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Filière"
                value={studentProfile.field}
              />
            )}
          </>
        )}

        {/* Infos enseignant */}
        {isTeacher && teacherProfile && (
          <>
            {teacherProfile.grade && (
              <StatRow
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Grade"
                value={
                  GRADE_LABELS[teacherProfile.grade] ?? teacherProfile.grade
                }
              />
            )}
            {teacherProfile.specialty && (
              <StatRow
                icon={<Shield className="h-3.5 w-3.5" />}
                label="Spécialité"
                value={teacherProfile.specialty}
              />
            )}
            {teacherProfile.maxProjects && (
              <StatRow
                icon={<GraduationCap className="h-3.5 w-3.5" />}
                label="Plafond projets"
                value={`${teacherProfile.maxProjects} max`}
              />
            )}
            {teacherProfile.responsibleLevel && (
              <StatRow
                icon={<Shield className="h-3.5 w-3.5" />}
                label="Niveau supervisé"
                value={
                  RESPONSIBLE_LEVEL_LABELS[teacherProfile.responsibleLevel] ??
                  teacherProfile.responsibleLevel
                }
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
