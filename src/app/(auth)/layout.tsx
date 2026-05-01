"use client";

import type { ReactNode } from "react";
import Link from "next/link";

/* ── Logo SUSTPA SVG ─────────────────────────────────────────── */
function SustpaLogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 2L2 8l12 6 12-6-12-6z" fill="currentColor" />
      <path d="M2 14l12 6 12-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 20l12 6 12-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --green-900: #0a3d26;
          --green-800: #0e4d30;
          --green-700: #156e48;
          --green-600: #1B8A5A;
          --green-400: #34bc82;
          --green-200: #a8e9cb;
          --green-50:  #edfaf4;
        }

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          overflow: hidden;
        }

        /* ── Panneau gauche ── */
        .auth-left {
          width: 44%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(155deg, var(--green-900) 0%, var(--green-700) 50%, var(--green-400) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
        }

        @media (max-width: 900px) { .auth-left { display: none; } }

        /* Bulles décoratives */
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.10);
        }
        .bubble-1 {
          width: 280px; height: 280px;
          bottom: -80px; left: -80px;
        }
        .bubble-2 {
          width: 200px; height: 200px;
          top: -50px; right: -50px;
        }
        .bubble-3 {
          width: 140px; height: 140px;
          top: 38%; left: 55%;
          background: rgba(255,255,255,0.07);
        }
        .bubble-4 {
          width: 90px; height: 90px;
          bottom: 28%; left: 18%;
          background: rgba(52,188,130,0.25);
        }
        .bubble-5 {
          width: 55px; height: 55px;
          top: 22%; left: 10%;
          background: rgba(255,255,255,0.12);
        }
        .bubble-6 {
          width: 180px; height: 180px;
          top: 45%; right: -60px;
          background: rgba(255,255,255,0.06);
        }

        /* Contenu panneau gauche */
        .left-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.03em;
          position: relative;
          z-index: 2;
        }

        .left-hero {
          position: relative;
          z-index: 2;
          color: #fff;
        }

        .left-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 0 12px;
          color: #fff;
        }

        .left-hero .sub {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.60);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
        }

        /* Dots déco bas */
        .left-dots {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); }
        .dot.active { width: 22px; border-radius: 3px; background: rgba(255,255,255,0.85); }

        /* ── Panneau droit ── */
        .auth-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 32px;
          background: #fff;
          position: relative;
        }

        /* Logo mobile */
        .auth-mobile-logo {
          display: none;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--green-600);
          margin-bottom: 32px;
          letter-spacing: -0.02em;
        }
        @media (max-width: 900px) { .auth-mobile-logo { display: flex; } }

        /* Carte formulaire */
        .auth-card {
          width: 100%;
          max-width: 400px;
        }

        /* Décoration coin droit */
        .auth-right-deco {
          position: absolute;
          top: -30px; right: -30px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(27,138,90,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-right-deco-2 {
          position: absolute;
          bottom: 40px; left: -20px;
          width: 100px; height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(27,138,90,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Footer droit */
        .auth-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 11px;
          color: #c0c8d0;
          font-weight: 500;
        }

        /* Animations */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        .auth-card { animation: fadeSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="auth-root">

        {/* ── Panneau gauche ── */}
        <div className="auth-left">
          {/* Bulles */}
          <div className="bubble bubble-1" />
          <div className="bubble bubble-2" />
          <div className="bubble bubble-3" />
          <div className="bubble bubble-4" />
          <div className="bubble bubble-5" />
          <div className="bubble bubble-6" />

          {/* Logo */}
          <div className="left-logo">
            <div style={{
              width: 36, height: 36,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <SustpaLogoMark size={20} />
            </div>
            SUSTPA
          </div>

          {/* Hero */}
          <div className="left-hero">
            <h1>BIENVENUE<br />SUR SUSTPA</h1>
            <p className="sub">Département Informatique</p>
          </div>

          {/* Dots pagination */}
          <div className="left-dots">
            <div className="dot active" />
            <div className="dot" />
            <div className="dot" />
          </div>
        </div>

        {/* ── Panneau droit ── */}
        <div className="auth-right">
          <div className="auth-right-deco" />
          <div className="auth-right-deco-2" />

          <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Logo mobile */}
            <div className="auth-mobile-logo">
              <div style={{
                width: 32, height: 32,
                background: "linear-gradient(135deg, #1B8A5A, #156e48)",
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <SustpaLogoMark size={18} />
              </div>
              SUSTPA
            </div>

            {/* Formulaire */}
            <div className="auth-card">
              {children}
            </div>

            <div className="auth-footer">
              © 2025 SUSTPA — Département Informatique
            </div>
          </div>
        </div>
      </div>
    </>
  );
}