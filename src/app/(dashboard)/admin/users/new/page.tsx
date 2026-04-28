"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, UserPlus } from "lucide-react";

import { usersApi } from "@/services/users.service";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// ─── Schema Zod — aligné sur le schéma DB réel ────────────────────────────────
// Colonnes student_profiles : matricule, level, filiere (pas field/promotion)
// Colonnes teacher_profiles : grade, specialite (pas specialty/department)
const schema = z
  .object({
    firstName: z.string().min(2, "Minimum 2 caractères"),
    lastName: z.string().min(2, "Minimum 2 caractères"),
    email: z.string().email("Email invalide"),
    role: z.enum(["STUDENT", "TEACHER", "RESPONSIBLE", "JURY_MEMBER"]),

    // Étudiant — correspond aux colonnes student_profiles
    matricule: z.string().optional(),
    level: z.string().optional(),
    filiere: z.string().optional(), // CORRECTION BUG 12 : filiere (pas field)

    // Enseignant — correspond aux colonnes teacher_profiles
    grade: z.string().optional(),
    specialite: z.string().optional(), // CORRECTION BUG 13 : specialite (pas specialty)
    // CORRECTION BUG 14 : coerce.number pour convertir l'input HTML (string) en number
    maxProjects: z
      .string()
      .regex(/^\d+$/)
      .transform((val) => parseInt(val, 10))
      .refine((val) => val >= 1 && val <= 20),

    // RESPONSIBLE : niveau supervisé obligatoire
    responsibleLevel: z.enum(["LICENCE", "MASTER", "DOCTORAL"]).optional(),
  })
  .refine((data) => data.role !== "RESPONSIBLE" || !!data.responsibleLevel, {
    message: "Un responsable doit avoir un niveau supervisé",
    path: ["responsibleLevel"],
  });

type FormValues = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { maxProjects: "5" },
  });

  const role = useWatch({ control, name: "role" });
  const levelValue = useWatch({ control, name: "level" });
  const gradeValue = useWatch({ control, name: "grade" });
  const responsibleLevelValue = useWatch({ control, name: "responsibleLevel" });

  const isStudent = role === "STUDENT";
  const isTeacher = ["TEACHER", "RESPONSIBLE", "JURY_MEMBER"].includes(role);
  const isResponsible = role === "RESPONSIBLE";

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await usersApi.create(data as Record<string, unknown>);
      toast.success(
        "Compte créé",
        "Le mot de passe temporaire est password123",
      );
      router.push("/admin/users");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue";
      setServerError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <PageHeader
        title="Créer un compte"
        description="Le mot de passe temporaire sera password123."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Utilisateurs", href: "/admin/users" },
          { label: "Nouveau" },
        ]}
      />

      <Alert variant="info" title="Mot de passe temporaire">
        Le compte sera créé avec le mot de passe <strong>password123</strong>.
        L&apos;utilisateur devra le changer à sa première connexion.
      </Alert>

      {serverError && <Alert variant="danger">{serverError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* ─── Informations générales ─────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 pt-4">
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
              label="Adresse email"
              type="email"
              placeholder="utilisateur@universite.sn"
              error={errors.email?.message}
              {...register("email")}
            />

            <Select
              label="Rôle"
              placeholder="Sélectionner un rôle"
              options={[
                { value: "STUDENT", label: "🎓 Étudiant" },
                { value: "TEACHER", label: "👨‍🏫 Enseignant" },
                { value: "RESPONSIBLE", label: "🏛️ Responsable de filière" },
                { value: "JURY_MEMBER", label: "⚖️ Membre du jury" },
              ]}
              value={role ?? ""}
              onChange={(v) => {
                setValue("role", v as FormValues["role"], {
                  shouldValidate: true,
                });
                setValue("responsibleLevel", undefined);
              }}
              error={errors.role?.message}
            />

            {/* Niveau supervisé — RESPONSIBLE uniquement */}
            {isResponsible && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                  🏛️ Niveau de filière supervisé
                </p>
                <Select
                  label="Niveau supervisé"
                  placeholder="Sélectionner un niveau"
                  options={[
                    { value: "LICENCE", label: "🎓 Licence (L1 / L2 / L3)" },
                    { value: "MASTER", label: "📘 Master (M1 / M2)" },
                    { value: "DOCTORAL", label: "🔬 Doctorat" },
                  ]}
                  value={responsibleLevelValue ?? ""}
                  onChange={(v) =>
                    setValue(
                      "responsibleLevel",
                      v as FormValues["responsibleLevel"],
                      { shouldValidate: true },
                    )
                  }
                  error={errors.responsibleLevel?.message}
                />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Le responsable aura accès à tous les projets du niveau
                  sélectionné.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Profil étudiant ─────────────────────────────────────── */}
        {isStudent && (
          <Card>
            <CardHeader>
              <CardTitle>Profil étudiant</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 pt-4">
              <Input
                label="Matricule"
                placeholder="ETU-2024-001"
                {...register("matricule")}
              />
              <Select
                label="Niveau"
                placeholder="Sélectionner"
                options={[
                  { value: "LICENCE_1", label: "Licence 1" },
                  { value: "LICENCE_2", label: "Licence 2" },
                  { value: "LICENCE_3", label: "Licence 3" },
                  { value: "MASTER_1", label: "Master 1" },
                  { value: "MASTER_2", label: "Master 2" },
                  { value: "DOCTORAT", label: "Doctorat" },
                ]}
                value={levelValue ?? ""}
                onChange={(v) => setValue("level", v)}
              />
              {/* CORRECTION BUG 12 : filiere (pas field) */}
              <Input
                label="Filière"
                placeholder="Informatique"
                {...register("filiere")}
              />
            </CardContent>
          </Card>
        )}

        {/* ─── Profil enseignant ───────────────────────────────────── */}
        {isTeacher && (
          <Card>
            <CardHeader>
              <CardTitle>Profil enseignant</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4 pt-4">
              <Select
                label="Grade"
                placeholder="Sélectionner"
                options={[
                  { value: "ASSISTANT", label: "Assistant" },
                  { value: "MAITRE_ASSISTANT", label: "Maître Assistant" },
                  { value: "MAITRE_CONF", label: "Maître Conférences" },
                  { value: "PROFESSEUR", label: "Professeur" },
                ]}
                value={gradeValue ?? ""}
                onChange={(v) => setValue("grade", v)}
              />
              {/* CORRECTION BUG 13 : specialite (pas specialty) */}
              <Input
                label="Spécialité"
                placeholder="Génie Logiciel"
                {...register("specialite")}
              />
              {/* CORRECTION BUG 14 : type number + coerce dans le schema Zod */}
              <Input
                label="Plafond de projets simultanés"
                type="number"
                min={1}
                max={20}
                defaultValue={5}
                {...register("maxProjects")}
              />
            </CardContent>
          </Card>
        )}

        <Separator />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!role}>
            <UserPlus className="h-4 w-4" /> Créer le compte
          </Button>
        </div>
      </form>
    </div>
  );
}
