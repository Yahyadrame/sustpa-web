"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";

const SHARED_STYLES = `
  .rp-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.04em;
    margin: 0 0 6px;
    line-height: 1.1;
  }
  .rp-sub { font-size: 13.5px; color: #94a3b8; font-weight: 500; margin: 0 0 28px; }
  .field-label {
    display: block; font-size: 12px; font-weight: 600; color: #374151;
    margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .auth-input {
    width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
    padding: 11px 42px 11px 16px; font-size: 14px; color: #111827;
    background: #f9fafb; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: 'DM Sans', sans-serif; box-sizing: border-box;
  }
  .auth-input:focus {
    border-color: #1B8A5A; box-shadow: 0 0 0 3px rgba(27,138,90,0.10); background: #fff;
  }
  .auth-input.err { border-color: #fca5a5; }
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
    margin-bottom: 20px; position: relative; overflow: hidden;
    animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1);
  }
  .auth-alert .bar { position: absolute; left:0; top:0; bottom:0; width:3px; border-radius: 10px 0 0 10px; }
  .auth-alert.error { background: #fff1f2; border: 1px solid #fecaca; color: #991b1b; }
  .auth-alert.error .bar { background: #ef4444; }
  .rules-box {
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
  }
  .rules-box ul { margin: 6px 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
  .rules-box li { font-size: 11.5px; color: #94a3b8; display: flex; align-items: center; gap: 5px; }
`;

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
      setServerError("Lien invalide ou expiré. Faites une nouvelle demande.");
    }
  };

  if (!token) {
    return (
      <>
        <style>{SHARED_STYLES}</style>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "#fff1f2",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <AlertCircle size={28} color="#ef4444" />
          </div>
          <h2 className="rp-title">Lien invalide</h2>
          <p className="rp-sub">Ce lien a expiré ou est incorrect.</p>
          <Link href="/forgot-password">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              style={{ borderRadius: 10 }}
            >
              Nouvelle demande
            </Button>
          </Link>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <style>{SHARED_STYLES}</style>
        <div
          style={{
            textAlign: "center",
            animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(135deg, #edfaf4, #d2f4e4)",
              border: "1px solid #a8e9cb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 24px -4px rgba(27,138,90,0.20)",
            }}
          >
            <CheckCircle2 size={32} color="#1B8A5A" />
          </div>
          <h2 className="rp-title">
            Mot de passe
            <br />
            mis à jour !
          </h2>
          <p className="rp-sub" style={{ marginBottom: 28 }}>
            Vous pouvez maintenant vous connecter.
          </p>
          <Button
            onClick={() => router.push("/login?changed=true")}
            size="lg"
            className="w-full"
            style={{ borderRadius: 10 }}
          >
            Se connecter
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{SHARED_STYLES}</style>

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
          marginBottom: 18,
        }}
      >
        <KeyRound size={20} color="#1B8A5A" />
      </div>

      <h1 className="rp-title">
        Nouveau
        <br />
        mot de passe
      </h1>
      <p className="rp-sub">Choisissez un mot de passe sécurisé.</p>

      {serverError && (
        <div className="auth-alert error">
          <div className="bar" />
          <AlertCircle size={14} style={{ marginLeft: 6, flexShrink: 0 }} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field-wrap">
          <label className="field-label">Nouveau mot de passe</label>
          <input
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            className={`auth-input${errors.password ? " err" : ""}`}
            {...register("password")}
          />
          <button
            type="button"
            className="input-icon-r"
            onClick={() => setShowPwd((v) => !v)}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.password && (
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
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="field-wrap">
          <label className="field-label">Confirmer</label>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className={`auth-input${errors.confirmPassword ? " err" : ""}`}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="input-icon-r"
            onClick={() => setShowConfirm((v) => !v)}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.confirmPassword && (
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
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="rules-box">
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}>
            Exigences
          </span>
          <ul>
            {[
              "8 caractères min.",
              "Une majuscule",
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
          isLoading={isSubmitting}
          style={{ borderRadius: 10 }}
        >
          {!isSubmitting && <KeyRound size={16} />}
          {isSubmitting ? "Mise à jour…" : "Réinitialiser"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
