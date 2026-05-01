"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

// ─── Schema Zod aligné sur les colonnes DB réelles ───────────────────────────
// student_profiles : matricule, level, field
// teacher_profiles : grade, specialty, maxProjects
const schema = z.object({
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  // Étudiant
  level: z.string().optional(),
  field: z.string().optional(),
  matricule: z.string().optional(),
  // Enseignant
  grade: z.string().optional(),
  specialty: z.string().optional(),
  maxProjects: z.number().int().min(1).max(20).optional(),
  responsibleLevel: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const LEVEL_OPTIONS = [
  { value: "", label: "Sélectionner" },
  { value: "LICENCE_1", label: "Licence 1" },
  { value: "LICENCE_2", label: "Licence 2" },
  { value: "LICENCE_3", label: "Licence 3" },
  { value: "MASTER_1", label: "Master 1" },
  { value: "MASTER_2", label: "Master 2" },
  { value: "DOCTORAT", label: "Doctorat" },
];

const GRADE_OPTIONS = [
  { value: "", label: "Sélectionner" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "MAITRE_ASSISTANT", label: "Maître Assistant" },
  { value: "MAITRE_CONF", label: "Maître Conférences" },
  { value: "PROFESSEUR", label: "Professeur" },
];

interface ProfileFormProps {
  profile: UserProfile;
  saving: boolean;
  onSubmit: (
    data: Parameters<typeof profileApi.updateMyProfile>[0],
  ) => Promise<void>;
}

// Import local pour le type — évite l'import circulaire
import { profileApi } from "@/services/profile.service";

export function ProfileForm({ profile, saving, onSubmit }: ProfileFormProps) {
  const isStudent = profile.role === "STUDENT";
  const isTeacher = ["TEACHER", "RESPONSIBLE"].includes(profile.role);

  const studentProfile = isStudentProfile(profile.profile)
    ? profile.profile
    : null;
  const teacherProfile = isTeacherProfile(profile.profile)
    ? profile.profile
    : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      level: studentProfile?.level ?? "",
      field: studentProfile?.field ?? "",
      matricule: studentProfile?.matricule ?? "",
      grade: teacherProfile?.grade ?? "",
      specialty: teacherProfile?.specialty ?? "",
      maxProjects: teacherProfile?.maxProjects ?? 5,
      responsibleLevel: teacherProfile?.responsibleLevel ?? "",
    },
  });

  // Resynchroniser si le profil change depuis l'extérieur
  useEffect(() => {
    const newStudentProfile = isStudentProfile(profile.profile)
      ? profile.profile
      : null;
    const newTeacherProfile = isTeacherProfile(profile.profile)
      ? profile.profile
      : null;
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      level: newStudentProfile?.level ?? "",
      field: newStudentProfile?.field ?? "",
      matricule: newStudentProfile?.matricule ?? "",
      grade: newTeacherProfile?.grade ?? "",
      specialty: newTeacherProfile?.specialty ?? "",
      maxProjects: newTeacherProfile?.maxProjects ?? 5,
      responsibleLevel: newTeacherProfile?.responsibleLevel ?? "",
    });
  }, [profile, reset]);

  const levelValue = watch("level");
  const gradeValue = watch("grade");

  const handleFormSubmit = async (data: FormValues) => {
    // Construire le payload uniquement avec les champs non vides
    const payload: Parameters<typeof profileApi.updateMyProfile>[0] = {};
    if (data.firstName) payload.firstName = data.firstName;
    if (data.lastName) payload.lastName = data.lastName;
    if (isStudent && studentProfile) {
      if (data.level) payload.level = data.level;
      if (data.field) payload.field = data.field;
    }
    if (isTeacher && teacherProfile) {
      if (data.grade) payload.grade = data.grade;
      if (data.specialty) payload.specialty = data.specialty;
      if (data.maxProjects) payload.maxProjects = data.maxProjects;
    }
    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => handleFormSubmit(data))}
      noValidate
      className="space-y-6"
    >
      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Informations générales
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Nom"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <Input
          label="Email"
          value={profile.email}
          disabled
          className="opacity-60 cursor-not-allowed"
        />
      </div>

      {/* Profil étudiant */}
      {isStudent && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Profil étudiant
            </h3>
            <Select
              label="Niveau"
              options={LEVEL_OPTIONS}
              value={levelValue ?? ""}
              onChange={(v) => setValue("level", v, { shouldDirty: true })}
            />
            <Input
              label="Filière"
              placeholder="Informatique"
              {...register("field")}
            />
            {studentProfile?.matricule && (
              <Input
                label="Matricule"
                value={studentProfile.matricule}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
            )}
          </div>
        </>
      )}

      {/* Profil enseignant */}
      {isTeacher && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Profil enseignant
            </h3>
            <Select
              label="Grade"
              options={GRADE_OPTIONS}
              value={gradeValue ?? ""}
              onChange={(v) => setValue("grade", v, { shouldDirty: true })}
            />
            <Input
              label="Spécialité"
              placeholder="Génie Logiciel"
              {...register("specialty")}
            />
            <Input
              label="Plafond de projets simultanés"
              type="number"
              min={1}
              max={20}
              {...register("maxProjects")}
            />
          </div>
        </>
      )}

      {/* Bouton sauvegarde */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </button>
        {!isDirty && !saving && (
          <p className="text-xs text-slate-400 mt-2">
            Aucune modification en attente.
          </p>
        )}
      </div>
    </form>
  );
}
