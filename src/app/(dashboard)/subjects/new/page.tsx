"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, BookPlus, Info, AlertCircle } from "lucide-react";

import { projectsApi } from "@/services/projects.service";
import { usersApi } from "@/services/users.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { UserDetail } from "@/types/user.types";

/* ── Schéma Zod — inchangé ── */
const schema = z.object({
  title: z.string().min(5, "Minimum 5 caractères").max(255),
  description: z.string().min(20, "Minimum 20 caractères"),
  type: z.enum(["PFE", "MEMOIRE", "THESE"], {
    message: "Choisissez un type de projet",
  }),
  supervisorId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewSubjectPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === "STUDENT";

  const [serverError, setServerError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<UserDetail[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      type: undefined,
      supervisorId: "",
    },
  });

  const typeValue = useWatch({ control, name: "type" });
  const supervisorValue = useWatch({ control, name: "supervisorId" });

  /* Charger enseignants pour étudiant — logique inchangée */
  useEffect(() => {
    if (!isStudent) return;
    void usersApi
      .getTeachers()
      .then(setTeachers)
      .catch(() =>
        toast.error("Impossible de charger la liste des encadrants"),
      );
  }, [isStudent, toast]);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    if (isStudent && !data.supervisorId) {
      setServerError("Vous devez choisir un encadrant pour votre sujet");
      return;
    }
    try {
      await projectsApi.createSubject({
        title: data.title,
        description: data.description,
        type: data.type,
        ...(isStudent && data.supervisorId
          ? { supervisorId: data.supervisorId }
          : {}),
      });
      toast.success("Sujet proposé — en attente de validation");
      router.push("/subjects");
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue",
      );
    }
  };

  return (
    <div
      className="space-y-6 max-w-2xl"
      style={{ animation: "fadeIn 0.22s ease-out" }}
    >
      <PageHeader
        title="Proposer un sujet"
        description={
          isStudent
            ? "Votre sujet sera examiné par le responsable de filière avant publication."
            : "Ce sujet sera visible par les étudiants après validation par le responsable."
        }
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sujets", href: "/subjects" },
          { label: "Nouveau" },
        ]}
      />

      {/* Info contextuelle */}
      {isStudent && (
        <div
          className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
          style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-blue-500" />
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5 ml-1" />
          <p className="text-blue-800 text-xs leading-relaxed">
            En tant qu&apos;étudiant, vous devez obtenir l&apos;accord préalable
            de l&apos;encadrant avant de soumettre ce sujet. Le responsable de
            filière pourra modifier l&apos;encadrant lors de la validation.
          </p>
        </div>
      )}

      <Card>
        {/* Erreur serveur */}
        {serverError && (
          <div
            className="mb-5 flex items-center gap-3 rounded-xl p-3.5 text-sm overflow-hidden relative"
            style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 ml-1" />
            <span className="text-red-800">{serverError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          <Input
            label="Titre du sujet"
            placeholder="Ex : Conception d'un système de…"
            error={errors.title?.message}
            {...register("title")}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
                Description
              </label>
              <span className="text-xs text-slate-400">min. 20 caractères</span>
            </div>
            <textarea
              rows={5}
              placeholder="Décrivez le sujet, ses objectifs et sa problématique…"
              className={[
                "w-full rounded-[0.625rem] border-[1.5px] bg-white px-4 py-3",
                "text-[0.9375rem] text-slate-900 placeholder:text-slate-400 resize-none",
                "focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)]",
                "transition-all font-sans tracking-[-0.01em]",
                errors.description ? "border-red-400" : "border-[#E8ECF0]",
              ].join(" ")}
              {...register("description")}
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <span className="h-1 w-1 rounded-full bg-red-500 inline-block" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Type */}
          <Select
            label="Type de projet"
            options={[
              { value: "PFE", label: "PFE" },
              { value: "MEMOIRE", label: "Mémoire" },
              { value: "THESE", label: "Thèse" },
            ]}
            value={typeValue ?? ""}
            onChange={(v) =>
              setValue("type", v as FormValues["type"], {
                shouldValidate: true,
              })
            }
            error={errors.type?.message}
          />

          {/* Encadrant — obligatoire pour étudiant */}
          {isStudent && (
            <div className="space-y-1.5">
              <Select
                label="Encadrant pressenti"
                placeholder="Sélectionnez l'enseignant"
                options={teachers.map((t) => ({
                  value: t.id,
                  label: `${t.firstName} ${t.lastName}`,
                }))}
                value={supervisorValue ?? ""}
                onChange={(v) =>
                  setValue("supervisorId", v, { shouldValidate: true })
                }
                error={errors.supervisorId?.message}
              />
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                Obligatoire — accord préalable de l&apos;enseignant requis.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {!isSubmitting && <BookPlus className="h-4 w-4" />}
              {isSubmitting ? "Publication…" : "Publier le sujet"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
