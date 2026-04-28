"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
  const toast = useToast();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordForm) => {
    try {
      await api.patch("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Mot de passe mis à jour");
      reset();
    } catch {
      toast.error("Mot de passe actuel incorrect");
    }
  };

  const PASSWORD_RULES = [
    { label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
    { label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
  ];

  return (
    <div className="space-y-6">
      {/* Changer mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary-600" />
            Modifier le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {/* Mot de passe actuel */}
            <div className="relative">
              <Input
                label="Mot de passe actuel"
                type={showCurrent ? "text" : "password"}
                error={errors.currentPassword?.message}
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Nouveau */}
            <div className="relative">
              <Input
                label="Nouveau mot de passe"
                type={showNew ? "text" : "password"}
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Confirmation */}
            <div className="relative">
              <Input
                label="Confirmer le nouveau mot de passe"
                type={showConfirm ? "text" : "password"}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Lock className="h-4 w-4" />
              Mettre à jour le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Règles de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary-600" />
            Règles de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {PASSWORD_RULES.map((rule) => (
            <div key={rule.label} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-300" />
              <span className="text-sm text-slate-600">{rule.label}</span>
            </div>
          ))}
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Après modification, toutes vos sessions actives seront invalidées
              et vous devrez vous reconnecter.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
