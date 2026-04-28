"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─────────────────────────────────────────────────────────────
   useSearchParams doit vivre dans un composant enfant enveloppé
   par <Suspense> — pattern Next.js App Router obligatoire.
───────────────────────────────────────────────────────────── */

function ResetPasswordContent() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await resetPassword(token, data.password);
      setSuccess(true);
    } catch {
      setServerError(
        "Lien invalide ou expiré. Veuillez faire une nouvelle demande.",
      );
    }
  };

  /* ── Token manquant ── */
  if (!token) {
    return (
      <div
        className="space-y-5 text-center"
        style={{ animation: "fadeIn 0.22s ease-out" }}
      >
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
        >
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-[-0.03em]">
            Lien invalide
          </h2>
          <p className="text-slate-500 text-sm">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="primary" size="lg" className="w-full">
            Faire une nouvelle demande
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Succès ── */
  if (success) {
    return (
      <div
        className="space-y-6 text-center"
        style={{ animation: "scaleIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div className="flex justify-center">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #edfaf4, #d2f4e4)",
              border: "1px solid #a8e9cb",
              boxShadow: "0 8px 24px -4px rgb(27 138 90/0.15)",
            }}
          >
            <CheckCircle2 className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-[1.5rem] font-bold text-slate-900 tracking-[-0.03em]">
            Mot de passe mis à jour
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez
            maintenant vous connecter.
          </p>
        </div>
        <Button
          onClick={() => router.push("/login?changed=true")}
          size="lg"
          className="w-full"
        >
          Se connecter
        </Button>
      </div>
    );
  }

  /* ── Formulaire ── */
  return (
    <div className="space-y-7" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* En-tête */}
      <div className="space-y-1.5">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #edfaf4, #d2f4e4)",
            border: "1px solid #a8e9cb",
          }}
        >
          <KeyRound className="h-5 w-5 text-primary-600" />
        </div>
        <h2 className="text-[1.5rem] font-bold text-slate-900 tracking-[-0.03em] leading-tight">
          Nouveau mot de passe
        </h2>
        <p className="text-slate-500 text-[0.9rem] leading-relaxed">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      {/* Erreur serveur */}
      {serverError && (
        <div
          className="flex items-center gap-3 rounded-xl p-3.5 text-sm overflow-hidden relative"
          style={{
            background: "#fff1f2",
            border: "1px solid #fecaca",
            animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 ml-1" />
          <span className="text-red-800">{serverError}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Nouveau mot de passe */}
        <Input
          label="Nouveau mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-100"
              aria-label={showPwd ? "Masquer" : "Afficher"}
            >
              {showPwd ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          {...register("password")}
        />

        {/* Confirmation */}
        <Input
          label="Confirmer le mot de passe"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-100"
              aria-label={showConfirm ? "Masquer" : "Afficher"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          {...register("confirmPassword")}
        />

        {/* Règles */}
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
        >
          <p className="text-xs font-medium text-slate-600 mb-2">
            Règles du mot de passe :
          </p>
          <ul className="space-y-1">
            {[
              "Au moins 8 caractères",
              "Une majuscule et une minuscule",
              "Un chiffre",
              "Un caractère spécial (@$!%*?&)",
            ].map((rule) => (
              <li
                key={rule}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          {!isSubmitting && <KeyRound className="h-4 w-4" />}
          {isSubmitting ? "Mise à jour…" : "Réinitialiser le mot de passe"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
