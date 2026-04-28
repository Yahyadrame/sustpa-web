"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send, ShieldAlert, Info } from "lucide-react";

import { projectsApi }  from "@/services/projects.service";
import { usersApi }     from "@/services/users.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast }     from "@/components/ui/toast";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Select }       from "@/components/ui/select";
import { Card }         from "@/components/ui/card";
import { PageHeader }   from "@/components/ui/page-header";
import type { UserDetail } from "@/types/user.types";

/* ── Schéma Zod — inchangé ── */
const schema = z.object({
  title:        z.string().min(5, "Au moins 5 caractères").max(255),
  description:  z.string().min(20, "Au moins 20 caractères"),
  type:         z.enum(["PFE", "MEMOIRE", "THESE"]),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Format : 2024-2025"),
  supervisorId: z.string().uuid("Encadrant invalide").optional(),
});
type FormValues = z.infer<typeof schema>;

/* ── Années académiques — logique inchangée ── */
function buildYearOptions(): { value: string; label: string }[] {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = month >= 9 ? year : year - 1;
  return [
    { value: `${start}-${start + 1}`,         label: `${start}-${start + 1} (en cours)`    },
    { value: `${start - 1}-${start}`,          label: `${start - 1}-${start}`               },
    { value: `${start + 1}-${start + 2}`,      label: `${start + 1}-${start + 2} (prochaine)` },
  ];
}
const YEAR_OPTIONS = buildYearOptions();

export default function NewProjectPage() {
  const router = useRouter();
  const toast  = useToast();
  const user   = useAuthStore((s) => s.user);

  /* ── Guard ADMIN — logique CDC v2 R1 inchangée ── */
  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") {
      toast.error("Accès non autorisé", "Les projets naissent uniquement d'un sujet validé. Proposez un sujet.");
      router.replace("/subjects/new");
    }
  }, [user, router, toast]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [teachers,    setTeachers]    = useState<UserDetail[]>([]);

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { academicYear: YEAR_OPTIONS[0].value },
    });

  const typeValue         = useWatch({ control, name: "type" });
  const academicYearValue = useWatch({ control, name: "academicYear" });
  const supervisorValue   = useWatch({ control, name: "supervisorId" });

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    void usersApi.getTeachers()
      .then(setTeachers)
      .catch(() => toast.error("Impossible de charger la liste des encadrants"));
  }, [user?.role, toast]);

  /* Redirect en cours */
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <p className="text-sm text-slate-500">Redirection vers la proposition de sujet…</p>
      </div>
    );
  }

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const project = await projectsApi.create({
        title:       data.title,
        description: data.description,
        type:        data.type,
        academicYear: data.academicYear,
        ...(data.supervisorId ? { supervisorId: data.supervisorId } : {}),
      });
      toast.success("Projet créé", "Le projet a été créé directement en statut PROPOSITION.");
      router.push(`/projects/${project.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Une erreur est survenue";
      setServerError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl" style={{ animation: "fadeIn 0.22s ease-out" }}>

      <PageHeader
        title="Créer un projet"
        description="Action réservée à l'Administrateur. Pour les étudiants et enseignants, le flux normal passe par la proposition de sujet."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projets",   href: "/projects"   },
          { label: "Nouveau" },
        ]}
      />

      {/* Avertissement admin */}
      <div
        className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
        style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-amber-400" />
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-500 ml-1" />
        <div>
          <p className="font-semibold text-amber-900 mb-0.5 tracking-[-0.01em]">
            Action administrative exceptionnelle
          </p>
          <p className="text-amber-700 text-xs leading-relaxed">
            Cette page crée un projet directement, sans passer par le flux sujet.
            Elle est réservée à l&apos;import de projets existants ou à des cas exceptionnels.
            Le flux normal passe par{" "}
            <Link href="/subjects/new" className="underline font-semibold">
              Proposer un sujet
            </Link>
            .
          </p>
        </div>
      </div>

      <Card>
        {/* Erreur serveur */}
        {serverError && (
          <div
            className="mb-5 flex items-center gap-3 rounded-xl p-3.5 text-sm overflow-hidden relative"
            style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
            <Info className="h-4 w-4 text-red-500 shrink-0 ml-1" />
            <span className="text-red-800">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          <Input
            label="Titre du projet"
            placeholder="Ex : Développement d'une application de gestion…"
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
              placeholder="Décrivez le projet, ses objectifs et sa problématique…"
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

          {/* Type + Année */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type de projet"
              options={[
                { value: "PFE",     label: "PFE"    },
                { value: "MEMOIRE", label: "Mémoire" },
                { value: "THESE",   label: "Thèse"  },
              ]}
              value={typeValue ?? ""}
              onChange={(v) => setValue("type", v as FormValues["type"])}
              error={errors.type?.message}
            />
            <Select
              label="Année académique"
              options={YEAR_OPTIONS}
              value={academicYearValue ?? ""}
              onChange={(v) => setValue("academicYear", v)}
              error={errors.academicYear?.message}
            />
          </div>

          {/* Encadrant optionnel */}
          <div className="space-y-1.5">
            <Select
              label="Encadrant (optionnel)"
              placeholder="Affecter un encadrant"
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.firstName} ${t.lastName}`,
              }))}
              value={supervisorValue ?? ""}
              onChange={(v) => setValue("supervisorId", v || undefined, { shouldValidate: true })}
              error={errors.supervisorId?.message}
            />
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              Optionnel — peut être affecté ou modifié ultérieurement.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {!isSubmitting && <Send className="h-4 w-4" />}
              {isSubmitting ? "Création…" : "Créer le projet"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}