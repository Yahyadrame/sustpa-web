"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2, Send } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await forgotPassword(data.email);
    setSuccess(true);
  };

  /* ── État succès ── */
  if (success) {
    return (
      <div
        className="space-y-6 text-center"
        style={{ animation: "scaleIn 0.22s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Icône succès */}
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
            Email envoyé !
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            Si un compte existe avec cette adresse, un lien de réinitialisation
            vous a été envoyé. Vérifiez aussi vos spams.
          </p>
        </div>

        {/* Encadré info */}
        <div
          className="rounded-xl p-4 text-left"
          style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
        >
          <p className="text-xs text-slate-500 leading-relaxed">
            Le lien est valable{" "}
            <span className="font-semibold text-slate-700">30 minutes</span>.
            Passé ce délai, faites une nouvelle demande.
          </p>
        </div>

        <Link href="/login">
          <Button variant="secondary" size="lg" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Formulaire ── */
  return (
    <div className="space-y-7" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* En-tête */}
      <div className="space-y-1.5">
        {/* Icône décorative */}
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #edfaf4, #d2f4e4)",
            border: "1px solid #a8e9cb",
          }}
        >
          <Mail className="h-5 w-5 text-primary-600" />
        </div>

        <h2 className="text-[1.5rem] font-bold text-slate-900 tracking-[-0.03em] leading-tight">
          Mot de passe oublié ?
        </h2>
        <p className="text-slate-500 text-[0.9rem] leading-relaxed">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@universite.sn"
          autoComplete="email"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register("email")}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          {!isSubmitting && <Send className="h-4 w-4" />}
          {isSubmitting ? "Envoi en cours…" : "Envoyer le lien"}
        </Button>
      </form>

      {/* Retour */}
      <Link href="/login">
        <Button variant="ghost" size="lg" className="w-full">
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Button>
      </Link>
    </div>
  );
}
