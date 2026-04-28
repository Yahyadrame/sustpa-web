"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus, Info } from "lucide-react";

import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project.types";

/* Schéma Zod — inchangé */
const schema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3).max(255),
  agenda: z.string().max(2000).optional(),
  scheduledAt: z.string().min(1, "Date requise"),
  durationMin: z.number().int().min(15).max(240),
});
type FormValues = z.infer<typeof schema>;

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onSubmit: (data: {
    projectId: string;
    studentId: string;
    title: string;
    agenda?: string;
    scheduledAt: string;
    durationMin: number;
  }) => Promise<void>;
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1h30" },
  { value: "120", label: "2 heures" },
];

export function CreateSessionModal({
  open,
  onClose,
  projects,
  onSubmit,
}: CreateSessionModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { durationMin: 60 },
  });

  const selectedProject = projects.find((p) => p.id === watch("projectId"));

  const handleClose = () => {
    reset();
    onClose();
  };

  /* onFormSubmit — logique inchangée */
  const onFormSubmit = async (data: FormValues) => {
    if (!selectedProject?.studentId) return;
    setSubmitting(true);
    try {
      await onSubmit({
        ...data,
        studentId: selectedProject.studentId,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Planifier une session Meet"
      description="Un lien de réunion sera généré et envoyé automatiquement à l'étudiant."
      size="lg"
    >
      {/* Contenu scrollable — logique div inchangée */}
      <div className="overflow-y-auto max-h-[60vh] px-0.5 space-y-5">
        {/* Projet */}
        {projects.length === 0 ? (
          <div
            className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-amber-400" />
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 ml-1" />
            <p className="text-amber-800">
              Aucun projet en cours disponible pour planifier une session.
            </p>
          </div>
        ) : (
          <Select
            label="Projet concerné"
            placeholder="Sélectionner un projet"
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            value={watch("projectId") ?? ""}
            onChange={(v) => setValue("projectId", v)}
            error={errors.projectId?.message}
          />
        )}

        {/* Titre */}
        <Input
          label="Titre de la session"
          placeholder="Ex : Suivi avancement — Chapitre 3"
          error={errors.title?.message}
          {...register("title")}
        />

        {/* Date + Durée */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Date et heure"
            required
            min={new Date().toISOString().slice(0, 16)}
            error={errors.scheduledAt?.message}
            {...register("scheduledAt")}
          />
          <Select
            label="Durée"
            options={DURATION_OPTIONS}
            value={String(watch("durationMin") ?? 60)}
            onChange={(v) => setValue("durationMin", Number(v))}
          />
        </div>

        {/* Ordre du jour */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="agenda"
              className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
            >
              Ordre du jour
            </label>
            <span className="text-xs text-slate-400">(optionnel)</span>
          </div>
          <textarea
            id="agenda"
            rows={3}
            placeholder="Points à aborder : revue chapitre 2, questions méthodologie…"
            className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans tracking-[-0.01em]"
            {...register("agenda")}
          />
        </div>
      </div>

      {/* Footer fixe — en dehors du div scrollable, logique inchangée */}
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Annuler
        </Button>
        <Button
          type="button"
          isLoading={submitting}
          disabled={!selectedProject}
          onClick={() => void handleSubmit(onFormSubmit)()}
        >
          <CalendarPlus className="h-4 w-4" />
          Planifier la session
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
