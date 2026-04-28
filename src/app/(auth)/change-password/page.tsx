"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Mail,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Lock,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validators";

/* ─── Schéma OTP ─────────────────────────────────────────────── */
const otpSchema = z.object({
  otpCode: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Chiffres uniquement"),
});
type OtpFormValues = z.infer<typeof otpSchema>;

type Step = "otp" | "password";

export default function ChangePasswordPage() {
  const { verifyOtp, resendOtp, changePassword } = useAuth();

  const [step, setStep] = useState<Step>("otp");
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Formulaires ── */
  const otpForm = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });
  const pwdForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  /* ── Handlers — logique 100% préservée ── */
  const onSubmitOtp = async (data: OtpFormValues) => {
    setServerError(null);
    try {
      await verifyOtp({ otpCode: data.otpCode });
      setStep("password");
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Code invalide ou expiré",
      );
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg(null);
    setServerError(null);
    try {
      const res = await resendOtp();
      setResendMsg(res.message);
      otpForm.reset();
    } catch {
      setServerError("Impossible de renvoyer le code. Reconnectez-vous.");
    } finally {
      setResending(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      await changePassword(data.currentPassword, data.newPassword);
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Une erreur est survenue",
      );
    }
  };

  return (
    <div className="space-y-6" style={{ animation: "fadeIn 0.22s ease-out" }}>
      {/* ── En-tête ── */}
      <div className="space-y-1.5">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #edfaf4, #d2f4e4)",
            border: "1px solid #a8e9cb",
          }}
        >
          <ShieldCheck className="h-5 w-5 text-primary-600" />
        </div>
        <h2 className="text-[1.5rem] font-bold text-slate-900 tracking-[-0.03em] leading-tight">
          Sécurisation du compte
        </h2>
        <p className="text-slate-500 text-[0.9rem] leading-relaxed">
          Première connexion — suivez les étapes pour activer votre compte.
        </p>
      </div>

      {/* ── Stepper ── */}
      <div
        className="flex items-center gap-0 rounded-xl overflow-hidden"
        style={{ border: "1px solid #E8ECF0", background: "#F6F8FA" }}
      >
        {/* Étape 1 */}
        <div
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200",
            step === "otp"
              ? "bg-white text-primary-700 shadow-[0_1px_4px_rgb(0_0_0/0.06)]"
              : "text-slate-400",
          )}
        >
          <div
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              step === "password"
                ? "bg-primary-600 text-white"
                : step === "otp"
                  ? "bg-primary-600 text-white"
                  : "bg-slate-200 text-slate-500",
            )}
          >
            {step === "password" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              "1"
            )}
          </div>
          <span className="hidden sm:inline">Vérification</span>
        </div>

        {/* Séparateur */}
        <div className="w-px h-10 bg-[#E8ECF0]" />

        {/* Étape 2 */}
        <div
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200",
            step === "password"
              ? "bg-white text-primary-700 shadow-[0_1px_4px_rgb(0_0_0/0.06)]"
              : "text-slate-400",
          )}
        >
          <div
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              step === "password"
                ? "bg-primary-600 text-white"
                : "bg-slate-200 text-slate-500",
            )}
          >
            2
          </div>
          <span className="hidden sm:inline">Mot de passe</span>
        </div>
      </div>

      {/* ── Feedbacks serveur ── */}
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

      {resendMsg && (
        <div
          className="flex items-center gap-3 rounded-xl p-3.5 text-sm overflow-hidden relative"
          style={{
            background: "#f0fdf4",
            border: "1px solid #a8e9cb",
            animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary-600" />
          <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0 ml-1" />
          <span className="text-primary-800">{resendMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ÉTAPE 1 — OTP
      ══════════════════════════════════════════════════════ */}
      {step === "otp" && (
        <div
          className="space-y-5"
          style={{ animation: "fadeIn 0.18s ease-out" }}
        >
          {/* Info email */}
          <div
            className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
            style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-blue-500" />
            <Mail className="h-4 w-4 text-blue-500 shrink-0 mt-0.5 ml-1" />
            <div className="text-blue-800">
              <p className="font-semibold">Code envoyé par email</p>
              <p className="mt-0.5 text-blue-700 text-[0.8125rem] leading-relaxed">
                Un code à 6 chiffres a été envoyé à votre adresse. Il est
                valable <strong>15 minutes</strong>.
              </p>
            </div>
          </div>

          <form
            onSubmit={otpForm.handleSubmit(onSubmitOtp)}
            noValidate
            className="space-y-5"
          >
            {/* Input OTP centré */}
            <div className="space-y-1.5">
              <label
                htmlFor="otpCode"
                className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
              >
                Code de vérification
              </label>
              <input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                autoComplete="one-time-code"
                className={cn(
                  "w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white",
                  "px-4 py-4 text-center text-2xl font-bold tracking-[0.6em] text-slate-900",
                  "placeholder:text-slate-200 placeholder:tracking-[0.4em] placeholder:text-lg",
                  "transition-all duration-150 hover:border-[#C8CDD5]",
                  "focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.12)]",
                  otpForm.formState.errors.otpCode &&
                    "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239_68_68/0.12)]",
                )}
                {...otpForm.register("otpCode")}
              />
              {otpForm.formState.errors.otpCode && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <span className="h-1 w-1 rounded-full bg-red-500 inline-block" />
                  {otpForm.formState.errors.otpCode.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={otpForm.formState.isSubmitting}
            >
              {!otpForm.formState.isSubmitting && (
                <ArrowRight className="h-4 w-4" />
              )}
              {otpForm.formState.isSubmitting
                ? "Vérification…"
                : "Vérifier le code"}
            </Button>
          </form>

          {/* Renvoyer */}
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
          >
            <p className="text-xs text-slate-400">Code non reçu ?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw
                className={cn("h-3 w-3", resending && "animate-spin")}
              />
              {resending ? "Envoi…" : "Renvoyer le code"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ÉTAPE 2 — NOUVEAU MOT DE PASSE
      ══════════════════════════════════════════════════════ */}
      {step === "password" && (
        <div
          className="space-y-5"
          style={{ animation: "fadeIn 0.18s ease-out" }}
        >
          {/* Confirmation identité */}
          <div
            className="flex items-start gap-3 rounded-xl p-4 text-sm overflow-hidden relative"
            style={{ background: "#f0fdf4", border: "1px solid #a8e9cb" }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary-600" />
            <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0 mt-0.5 ml-1" />
            <div className="text-primary-800">
              <p className="font-semibold">Identité vérifiée</p>
              <p className="mt-0.5 text-primary-700 text-[0.8125rem] leading-relaxed">
                Définissez maintenant votre mot de passe personnel.
              </p>
            </div>
          </div>

          <form
            onSubmit={pwdForm.handleSubmit(onSubmitPassword)}
            noValidate
            className="space-y-4"
          >
            {/* Mot de passe temporaire */}
            <Input
              label="Mot de passe temporaire"
              hint="password123"
              type={showCurrent ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              error={pwdForm.formState.errors.currentPassword?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-100"
                  aria-label={showCurrent ? "Masquer" : "Afficher"}
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              {...pwdForm.register("currentPassword")}
            />

            {/* Nouveau mot de passe */}
            <Input
              label="Nouveau mot de passe"
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              error={pwdForm.formState.errors.newPassword?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-100"
                  aria-label={showNew ? "Masquer" : "Afficher"}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              {...pwdForm.register("newPassword")}
            />

            {/* Confirmation */}
            <Input
              label="Confirmer le nouveau mot de passe"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              error={pwdForm.formState.errors.confirmPassword?.message}
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
              {...pwdForm.register("confirmPassword")}
            />

            {/* Règles */}
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
            >
              <p className="text-xs font-medium text-slate-600 mb-2">
                Exigences :
              </p>
              <ul className="grid grid-cols-2 gap-1">
                {[
                  "8 caractères minimum",
                  "Une majuscule",
                  "Une minuscule",
                  "Un chiffre",
                  "Un caractère spécial",
                ].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-center gap-1.5 text-xs text-slate-400"
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
              isLoading={pwdForm.formState.isSubmitting}
            >
              {!pwdForm.formState.isSubmitting && (
                <ShieldCheck className="h-4 w-4" />
              )}
              {pwdForm.formState.isSubmitting
                ? "Sécurisation…"
                : "Sécuriser mon compte"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
