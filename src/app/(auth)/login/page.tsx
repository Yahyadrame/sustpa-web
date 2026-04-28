"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ── Séparateur "ou" ── */
function Divider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "4px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#E8ECF0" }} />
      <span
        style={{
          fontSize: 12,
          color: "#94a3b8",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#E8ECF0" }} />
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const passwordChanged = searchParams.get("changed") === "true";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

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
    <div
      className="space-y-6"
      style={{ animation: "fadeInUp 0.28s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {/* ── Titre ── */}
      <div style={{ marginBottom: 8 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.04em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Sign in
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: "#64748b",
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          Connectez-vous à votre espace SUSTPA
        </p>
      </div>

      {/* ── Feedbacks ── */}
      {passwordChanged && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#f0fdf4",
            border: "1px solid #a8e9cb",
            borderRadius: 10,
            padding: "11px 14px",
            fontSize: 13,
            color: "#166534",
            position: "relative",
            overflow: "hidden",
            animation: "slideUp 0.22s ease-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: "#1B8A5A",
              borderRadius: "4px 0 0 4px",
            }}
          />
          <CheckCircle2
            size={15}
            color="#1B8A5A"
            style={{ flexShrink: 0, marginLeft: 4 }}
          />
          <span style={{ fontWeight: 500 }}>
            Mot de passe mis à jour. Reconnectez-vous.
          </span>
        </div>
      )}

      {serverError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff1f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: "11px 14px",
            fontSize: 13,
            color: "#991b1b",
            position: "relative",
            overflow: "hidden",
            animation: "slideUp 0.22s ease-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: "#ef4444",
              borderRadius: "4px 0 0 4px",
            }}
          />
          <AlertCircle
            size={15}
            color="#ef4444"
            style={{ flexShrink: 0, marginLeft: 4 }}
          />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Formulaire ── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* User Name */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 6,
              letterSpacing: "-0.01em",
            }}
          >
            User Name
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1.5px solid ${errors.email ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 8,
              padding: "0 14px",
              background: "#fafafa",
              transition: "all 0.15s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = "#1B8A5A";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(27,138,90,0.10)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = errors.email
                ? "#fca5a5"
                : "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#fafafa";
            }}
          >
            <Mail size={15} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              type="email"
              placeholder="User Name"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                padding: "11px 0",
                fontSize: 14,
                color: "#0f172a",
                fontFamily: "'DM Sans',sans-serif",
              }}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <label
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#374151",
                letterSpacing: "-0.01em",
              }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: 12,
                color: "#1B8A5A",
                fontWeight: 600,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                  "underline";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.textDecoration =
                  "none";
              }}
            >
              Forgot Password?
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1.5px solid ${errors.password ? "#fca5a5" : "#e2e8f0"}`,
              borderRadius: 8,
              padding: "0 14px",
              background: "#fafafa",
              transition: "all 0.15s",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.borderColor = "#1B8A5A";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(27,138,90,0.10)";
              e.currentTarget.style.background = "#fff";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = errors.password
                ? "#fca5a5"
                : "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#fafafa";
            }}
          >
            <Lock size={15} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                padding: "11px 0",
                fontSize: 14,
                color: "#0f172a",
                fontFamily: "'DM Sans',sans-serif",
              }}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#1B8A5A",
                fontWeight: 700,
                fontSize: 12,
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : "SHOW"}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            onClick={() => setRememberMe((v) => !v)}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              border: `2px solid ${rememberMe ? "#1B8A5A" : "#cbd5e1"}`,
              background: rememberMe ? "#1B8A5A" : "#fff",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            {rememberMe && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 5L4 7.5L8.5 2.5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span
            style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}
            onClick={() => setRememberMe((v) => !v)}
          >
            Remember me
          </span>
        </div>

        {/* Bouton Sign in */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: 8,
            border: "none",
            background: isSubmitting ? "#4caf7d" : "#0f2a6e",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            letterSpacing: "0.02em",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.2s",
            opacity: isSubmitting ? 0.8 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "#1a3d8a";
              b.style.transform = "translateY(-1px)";
              b.style.boxShadow = "0 4px 16px rgba(15,42,110,0.35)";
            }
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = isSubmitting ? "#4caf7d" : "#0f2a6e";
            b.style.transform = "none";
            b.style.boxShadow = "none";
          }}
        >
          {isSubmitting ? (
            <svg
              style={{ animation: "spin 0.9s linear infinite" }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <path
                d="M12 2a10 10 0 0110 10"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <LogIn size={16} />
          )}
          {isSubmitting ? "Connexion…" : "Sing in"}
        </button>

        <Divider label="Or" />

        {/* Bouton secondaire */}
        <button
          type="button"
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            border: "2px solid #0f2a6e",
            background: "#fff",
            color: "#0f2a6e",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#f0f4ff";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#fff";
          }}
        >
          Sing in with other
        </button>
      </form>

      {/* Bas de formulaire */}
      <p style={{ textAlign: "center", fontSize: 12.5, color: "#64748b" }}>
        Don&apos;t have an account?{" "}
        <span style={{ color: "#1B8A5A", fontWeight: 700, cursor: "pointer" }}>
          Sign Up
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#94a3b8",
            display: "block",
            marginTop: 4,
          }}
        >
          Votre compte est créé par l&apos;administrateur de
          l&apos;établissement.
        </span>
      </p>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
