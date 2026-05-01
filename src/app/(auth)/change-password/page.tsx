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
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validators";

const otpSchema = z.object({
  otpCode: z
    .string()
    .length(6, "6 chiffres requis")
    .regex(/^\d{6}$/, "Chiffres uniquement"),
});
type OtpFormValues = z.infer<typeof otpSchema>;
type Step = "otp" | "password";

const STYLES = `
  .cp-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    color: #111827; letter-spacing: -0.04em;
    margin: 0 0 6px; line-height: 1.1;
  }
  .cp-sub { font-size: 13.5px; color: #94a3b8; font-weight: 500; margin: 0 0 22px; }

  /* Stepper */
  .stepper {
    display: flex; border-radius: 10px; overflow: hidden;
    border: 1.5px solid #e5e7eb; margin-bottom: 22px; background: #f9fafb;
  }
  .step-item {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 11px 8px; font-size: 13px; font-weight: 600;
    color: #c0c8d0; transition: all 0.2s; border: none; background: transparent;
  }
  .step-item.active {
    background: #fff; color: #1B8A5A;
    box-shadow: inset 0 0 0 1px rgba(27,138,90,0.15);
  }
  .step-item.done { color: #1B8A5A; }
  .step-num {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; background: #e5e7eb; color: #94a3b8;
    flex-shrink: 0; transition: all 0.2s;
  }
  .step-num.active { background: #1B8A5A; color: #fff; }
  .step-num.done   { background: #1B8A5A; color: #fff; }
  .step-divider { width: 1px; background: #e5e7eb; }

  /* Input base */
  .auth-input {
    width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
    padding: 11px 42px 11px 16px; font-size: 14px; color: #111827;
    background: #f9fafb; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'DM Sans', sans-serif; box-sizing: border-box;
  }
  .auth-input:focus { border-color: #1B8A5A; box-shadow: 0 0 0 3px rgba(27,138,90,0.10); background: #fff; }
  .auth-input.err   { border-color: #fca5a5; }

  .otp-input {
    width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
    padding: 14px 16px; font-size: 24px; font-weight: 700;
    color: #111827; background: #f9fafb; outline: none;
    text-align: center; letter-spacing: 0.5em;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'DM Sans', sans-serif; box-sizing: border-box;
  }
  .otp-input::placeholder { letter-spacing: 0.3em; font-size: 18px; color: #d1d5db; }
  .otp-input:focus { border-color: #1B8A5A; box-shadow: 0 0 0 3px rgba(27,138,90,0.10); background: #fff; }
  .otp-input.err { border-color: #fca5a5; }

  .field-label {
    display: block; font-size: 12px; font-weight: 600; color: #374151;
    margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .field-wrap { position: relative; margin-bottom: 14px; }
  .input-icon-r {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #9ca3af;
    display: flex; align-items: center; padding: 0;
  }
  .input-icon-r:hover { color: #374151; }
  .field-err { font-size: 11px; color: #ef4444; margin-top: 4px; display: flex; align-items: center; gap: 4px; }

  .auth-alert {
    display: flex; align-items: center; gap: 10px;
    border-radius: 10px; padding: 10px 14px; font-size: 13px;
    margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .auth-alert .bar { position: absolute; left:0; top:0; bottom:0; width:3px; border-radius: 10px 0 0 10px; }
  .auth-alert.success { background: #f0fdf4; border: 1px solid #a8e9cb; color: #166534; }
  .auth-alert.success .bar { background: #1B8A5A; }
  .auth-alert.error   { background: #fff1f2; border: 1px solid #fecaca; color: #991b1b; }
  .auth-alert.error   .bar { background: #ef4444; }
  .auth-alert.info    { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
  .auth-alert.info    .bar { background: #3b82f6; }

  .resend-row {
    display: flex; align-items: center; justify-content: space-between;
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 10px 16px; margin-top: 14px;
  }
  .resend-text { font-size: 12.5px; color: #94a3b8; }
  .resend-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; font-weight: 600; color: #1B8A5A;
    background: none; border: none; cursor: pointer; padding: 0;
  }
  .resend-btn:hover { text-decoration: underline; }
  .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .rules-box {
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
  }
  .rules-box ul {
    margin: 6px 0 0; padding: 0; list-style: none;
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
  }
  .rules-box li { font-size: 11.5px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
`;

export default function ChangePasswordPage() {
  const { verifyOtp, resendOtp, changePassword } = useAuth();

  const [step, setStep] = useState<Step>("otp");
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const otpForm = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });
  const pwdForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

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
    <>
      <style>{STYLES}</style>

      {/* Icon déco */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          background: "linear-gradient(135deg, #edfaf4, #d2f4e4)",
          border: "1px solid #a8e9cb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <ShieldCheck size={22} color="#1B8A5A" />
      </div>

      <h1 className="cp-title">
        Sécurisation
        <br />
        du compte
      </h1>
      <p className="cp-sub">Première connexion — activez votre compte.</p>

      {/* Stepper */}
      <div className="stepper">
        <div className={`step-item${step === "otp" ? " active" : " done"}`}>
          <div className={`step-num${step === "otp" ? " active" : " done"}`}>
            {step === "password" ? <CheckCircle2 size={12} /> : "1"}
          </div>
          <span>Vérification</span>
        </div>
        <div className="step-divider" />
        <div className={`step-item${step === "password" ? " active" : ""}`}>
          <div className={`step-num${step === "password" ? " active" : ""}`}>
            2
          </div>
          <span>Mot de passe</span>
        </div>
      </div>

      {/* Alertes */}
      {serverError && (
        <div className="auth-alert error">
          <div className="bar" />
          <AlertCircle size={14} style={{ marginLeft: 6, flexShrink: 0 }} />
          {serverError}
        </div>
      )}
      {resendMsg && (
        <div className="auth-alert success">
          <div className="bar" />
          <CheckCircle2 size={14} style={{ marginLeft: 6, flexShrink: 0 }} />
          {resendMsg}
        </div>
      )}

      {/* ── ÉTAPE 1 : OTP ── */}
      {step === "otp" && (
        <div style={{ animation: "fadeIn 0.18s ease-out" }}>
          <div className="auth-alert info" style={{ marginBottom: 18 }}>
            <div className="bar" />
            <Mail size={14} style={{ marginLeft: 6, flexShrink: 0 }} />
            <span>
              Un code à 6 chiffres a été envoyé à votre email. Valable{" "}
              <strong>15 minutes</strong>.
            </span>
          </div>

          <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} noValidate>
            <div className="field-wrap">
              <label className="field-label">Code de vérification</label>
              <input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                autoComplete="one-time-code"
                className={`otp-input${otpForm.formState.errors.otpCode ? " err" : ""}`}
                {...otpForm.register("otpCode")}
              />
              {otpForm.formState.errors.otpCode && (
                <p className="field-err">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                    }}
                  />
                  {otpForm.formState.errors.otpCode.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={otpForm.formState.isSubmitting}
              style={{ borderRadius: 10 }}
            >
              {!otpForm.formState.isSubmitting && <ArrowRight size={16} />}
              {otpForm.formState.isSubmitting
                ? "Vérification…"
                : "Vérifier le code"}
            </Button>
          </form>

          <div className="resend-row">
            <span className="resend-text">Code non reçu ?</span>
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              <RotateCcw
                size={12}
                style={{
                  animation: resending ? "spin 1s linear infinite" : "none",
                }}
              />
              {resending ? "Envoi…" : "Renvoyer le code"}
            </button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : MOT DE PASSE ── */}
      {step === "password" && (
        <div style={{ animation: "fadeIn 0.18s ease-out" }}>
          <div className="auth-alert success" style={{ marginBottom: 18 }}>
            <div className="bar" />
            <CheckCircle2 size={14} style={{ marginLeft: 6, flexShrink: 0 }} />
            Identité vérifiée — définissez votre mot de passe.
          </div>

          <form onSubmit={pwdForm.handleSubmit(onSubmitPassword)} noValidate>
            {/* Mot de passe temporaire */}
            <div className="field-wrap">
              <label className="field-label">Mot de passe temporaire</label>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`auth-input${pwdForm.formState.errors.currentPassword ? " err" : ""}`}
                {...pwdForm.register("currentPassword")}
              />
              <button
                type="button"
                className="input-icon-r"
                onClick={() => setShowCurrent((v) => !v)}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {pwdForm.formState.errors.currentPassword && (
                <p className="field-err">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                    }}
                  />
                  {pwdForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* Nouveau */}
            <div className="field-wrap">
              <label className="field-label">Nouveau mot de passe</label>
              <input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`auth-input${pwdForm.formState.errors.newPassword ? " err" : ""}`}
                {...pwdForm.register("newPassword")}
              />
              <button
                type="button"
                className="input-icon-r"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {pwdForm.formState.errors.newPassword && (
                <p className="field-err">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                    }}
                  />
                  {pwdForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirmer */}
            <div className="field-wrap">
              <label className="field-label">Confirmer</label>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`auth-input${pwdForm.formState.errors.confirmPassword ? " err" : ""}`}
                {...pwdForm.register("confirmPassword")}
              />
              <button
                type="button"
                className="input-icon-r"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {pwdForm.formState.errors.confirmPassword && (
                <p className="field-err">
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                    }}
                  />
                  {pwdForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="rules-box">
              <span
                style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}
              >
                Exigences
              </span>
              <ul>
                {[
                  "8 caractères min.",
                  "Une majuscule",
                  "Une minuscule",
                  "Un chiffre",
                  "Un caractère spécial",
                ].map((r) => (
                  <li key={r}>
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#d1d5db",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={pwdForm.formState.isSubmitting}
              style={{ borderRadius: 10 }}
            >
              {!pwdForm.formState.isSubmitting && <ShieldCheck size={16} />}
              {pwdForm.formState.isSubmitting
                ? "Sécurisation…"
                : "Sécuriser mon compte"}
            </Button>
          </form>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
