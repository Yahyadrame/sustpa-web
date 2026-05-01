"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, CheckCircle2, AlertCircle } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const passwordChanged = searchParams.get("changed") === "true";

  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data);
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Identifiants incorrects",
      );
    }
  };

  return (
    <>
      <style>{`
        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin: 0 0 6px;
        }
        .login-sub {
          font-size: 13.5px;
          color: #94a3b8;
          font-weight: 500;
          margin: 0 0 32px;
        }
        .input-row { display: flex; flex-direction: column; gap: 14px; }
        .field-wrap { position: relative; }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .auth-input {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 11px 40px 11px 16px;
          font-size: 14px;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: #1B8A5A;
          box-shadow: 0 0 0 3px rgba(27,138,90,0.10);
          background: #fff;
        }
        .auth-input.err { border-color: #fca5a5; }
        .auth-input.err:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }
        .input-icon-r {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .input-icon-r:hover { color: #374151; }
        .field-err {
          font-size: 11px;
          color: #ef4444;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Divider */
        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: #d1d5db;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
        }
        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f0f0f0;
        }

        /* Lien bas */
        .bottom-link {
          text-align: center;
          font-size: 12.5px;
          color: #94a3b8;
          margin-top: 20px;
        }
        .bottom-link a {
          color: #1B8A5A;
          font-weight: 600;
          text-decoration: none;
        }
        .bottom-link a:hover { text-decoration: underline; }

        /* Alert */
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          animation: slideUp 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-alert .bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 10px 0 0 10px;
        }
        .auth-alert.success { background: #f0fdf4; border: 1px solid #a8e9cb; color: #166534; }
        .auth-alert.success .bar { background: #1B8A5A; }
        .auth-alert.error   { background: #fff1f2; border: 1px solid #fecaca; color: #991b1b; }
        .auth-alert.error   .bar { background: #ef4444; }

        /* Remember row */
        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }
        .remember-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
        }
        .remember-label input { accent-color: #1B8A5A; width: 14px; height: 14px; cursor: pointer; }
        .forgot-link {
          font-size: 12.5px;
          color: #1B8A5A;
          font-weight: 600;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }
      `}</style>

      {/* Titre */}
      <h1 className="login-title">Connexion</h1>
      <p className="login-sub">Accédez à votre espace académique</p>

      {/* Alertes */}
      {passwordChanged && (
        <div className="auth-alert success">
          <div className="bar" />
          <CheckCircle2 size={15} style={{ marginLeft: 6, flexShrink: 0 }} />
          Mot de passe mis à jour. Reconnectez-vous.
        </div>
      )}
      {serverError && (
        <div className="auth-alert error">
          <div className="bar" />
          <AlertCircle size={15} style={{ marginLeft: 6, flexShrink: 0 }} />
          {serverError}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="input-row">
          {/* Email */}
          <div className="field-wrap">
            <label className="field-label">Adresse email</label>
            <input
              type="email"
              placeholder="vous@universite.sn"
              autoComplete="email"
              className={`auth-input${errors.email ? " err" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="field-err">
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#ef4444",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="field-wrap">
            <label className="field-label">Mot de passe</label>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`auth-input${errors.password ? " err" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              className="input-icon-r"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Masquer" : "Afficher"}
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
                    flexShrink: 0,
                  }}
                />
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="remember-row" style={{ marginTop: 14 }}>
          <label className="remember-label">
            <input type="checkbox" />
            Se souvenir de moi
          </label>
          <Link href="/forgot-password" className="forgot-link">
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Bouton connexion */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          style={{
            marginTop: 22,
            borderRadius: 10,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {!isSubmitting && <LogIn size={16} />}
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>

        {/* Divider */}
        <div className="or-divider">Ou</div>

        {/* Bouton secondaire */}
        <button
          type="button"
          disabled
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            background: "#fff",
            color: "#94a3b8",
            fontSize: 14,
            fontWeight: 600,
            cursor: "not-allowed",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Connexion SSO institutionnel
        </button>
      </form>

      {/* Bas de page */}
      <div className="bottom-link">
        Pas encore de compte ? <a href="#">Contactez l&apos;admin</a>
      </div>
    </>
  );
}
