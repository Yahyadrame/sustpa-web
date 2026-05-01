"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";

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

  if (success) {
    return (
      <>
        <style>{`
          .success-box {
            text-align: center;
            animation: scaleIn 0.25s cubic-bezier(0.16,1,0.3,1);
          }
          .success-icon-wrap {
            width: 68px; height: 68px;
            border-radius: 20px;
            background: linear-gradient(135deg, #edfaf4, #d2f4e4);
            border: 1px solid #a8e9cb;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 24px;
            box-shadow: 0 8px 24px -4px rgba(27,138,90,0.20);
          }
          .success-title {
            font-family: 'Syne', sans-serif;
            font-size: 26px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.04em;
            margin: 0 0 8px;
          }
          .success-text {
            font-size: 13.5px;
            color: #94a3b8;
            line-height: 1.6;
            margin: 0 0 28px;
          }
        `}</style>
        <div className="success-box">
          <div className="success-icon-wrap">
            <CheckCircle2 size={32} color="#1B8A5A" />
          </div>
          <h2 className="success-title">Email envoyé !</h2>
          <p className="success-text">
            Si un compte existe avec cette adresse, un lien vous a été envoyé.
            <br />
            Vérifiez aussi vos spams.
          </p>
          <Link href="/login">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              style={{ borderRadius: 10 }}
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .fp-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.04em;
          margin: 0 0 6px;
          line-height: 1.1;
        }
        .fp-sub {
          font-size: 13.5px;
          color: #94a3b8;
          font-weight: 500;
          margin: 0 0 28px;
        }
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
          padding: 11px 16px;
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
        .field-err {
          font-size: 11px; color: #ef4444; margin-top: 4px;
          display: flex; align-items: center; gap: 4px;
        }
      `}</style>

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
          marginBottom: 18,
        }}
      >
        <Send size={20} color="#1B8A5A" />
      </div>

      <h1 className="fp-title">
        Mot de passe
        <br />
        oublié ?
      </h1>
      <p className="fp-sub">Entrez votre email pour recevoir un lien.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
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
                }}
              />
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          style={{ marginTop: 20, borderRadius: 10 }}
        >
          {!isSubmitting && <Send size={16} />}
          {isSubmitting ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link href="/login">
          <Button variant="ghost" size="md" style={{ borderRadius: 10 }}>
            <ArrowLeft size={15} />
            Retour à la connexion
          </Button>
        </Link>
      </div>
    </>
  );
}
