"use client";

import type { ReactNode } from "react";

/* ─── Panneau gauche : blobs émeraude animés ──────────────────── */
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between"
      style={{
        background: "linear-gradient(150deg, #0a3d26 0%, #0f5c38 30%, #1B8A5A 65%, #24a870 100%)",
      }}
    >
      {/* ─── Blobs décoratifs ─── */}
      {/* Grand blob central-gauche */}
      <div style={{
        position: "absolute", left: "-12%", top: "18%",
        width: 340, height: 340,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        filter: "blur(1px)",
        animation: "blobPulse1 7s ease-in-out infinite",
      }} />
      {/* Blob moyen haut-droite */}
      <div style={{
        position: "absolute", right: "-8%", top: "-6%",
        width: 260, height: 260,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.10)",
        animation: "blobPulse2 9s ease-in-out infinite",
      }} />
      {/* Blob bas-droite */}
      <div style={{
        position: "absolute", right: "-5%", bottom: "8%",
        width: 220, height: 220,
        borderRadius: "50%",
        background: "rgba(10,61,38,0.45)",
        animation: "blobPulse3 11s ease-in-out infinite",
      }} />
      {/* Blob petit haut-gauche */}
      <div style={{
        position: "absolute", left: "10%", top: "8%",
        width: 120, height: 120,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        animation: "blobPulse2 6s ease-in-out infinite reverse",
      }} />
      {/* Blob bas-gauche */}
      <div style={{
        position: "absolute", left: "-6%", bottom: "12%",
        width: 180, height: 180,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        animation: "blobPulse1 8s ease-in-out infinite 2s",
      }} />
      {/* Blob accent clair */}
      <div style={{
        position: "absolute", left: "40%", top: "55%",
        width: 90, height: 90,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
        animation: "blobPulse3 5s ease-in-out infinite 1s",
      }} />

      {/* ─── Contenu ─── */}
      <div style={{ position: "relative", zIndex: 10, padding: "44px 40px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" />
              <path d="M2 13l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 18l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em" }}>
            SUSTPA
          </span>
        </div>
      </div>

      {/* ─── Message central ─── */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 44px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
          Département Informatique
        </p>
        <h1 style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.04em", margin: 0 }}>
          WELCOME
        </h1>
        <h2 style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em", marginTop: 8, marginBottom: 0 }}>
          Votre espace académique
        </h2>
        <p style={{ color: "rgba(255,255,255,0.50)", fontFamily: "'DM Sans',sans-serif", fontWeight: 400, fontSize: 13.5, lineHeight: 1.7, marginTop: 18, maxWidth: 320 }}>
          Gérez vos projets académiques (PFE, Mémoire, Thèse) de la proposition jusqu&apos;à la soutenance, en toute sécurité.
        </p>

        {/* Badges stats */}
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          {[
            { val: "PFE", lbl: "Projets" },
            { val: "100%", lbl: "Sécurisé" },
            { val: "JWT", lbl: "Auth" },
          ].map((s) => (
            <div key={s.val} style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 12, padding: "10px 16px",
              backdropFilter: "blur(6px)",
            }}>
              <p style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15, margin: 0 }}>{s.val}</p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans',sans-serif", fontSize: 11, margin: 0, marginTop: 1 }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bas ─── */}
      <div style={{ position: "relative", zIndex: 10, padding: "28px 44px" }}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>
          © 2025 SUSTPA · Département Informatique
        </p>
      </div>

      <style>{`
        @keyframes blobPulse1 {
          0%,100% { transform: scale(1) translate(0,0); }
          50% { transform: scale(1.08) translate(12px,-8px); }
        }
        @keyframes blobPulse2 {
          0%,100% { transform: scale(1) translate(0,0); }
          50% { transform: scale(0.94) translate(-8px,10px); }
        }
        @keyframes blobPulse3 {
          0%,100% { transform: scale(1) translate(0,0); }
          50% { transform: scale(1.12) translate(6px,6px); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.92); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

/* ─── Layout principal ───────────────────────────────────────── */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans',sans-serif", background: "#F6F8FA" }}>
      <LeftPanel />

      {/* Panneau droit */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F6F8FA" }}>
        {/* Logo mobile */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "28px 28px 0" }}
          className="lg:hidden">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #1B8A5A, #0f5c38)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" />
              <path d="M2 13l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", letterSpacing: "-0.03em" }}>SUSTPA</span>
        </div>

        {/* Zone formulaire */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            {/* Carte */}
            <div style={{
              background: "#fff",
              borderRadius: 20,
              padding: "40px 40px 36px",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 12px 40px -8px rgba(0,0,0,0.12)",
              animation: "fadeInUp 0.28s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {children}
            </div>

            <p style={{ textAlign: "center", fontSize: 11.5, color: "#94a3b8", marginTop: 20 }}>
              © 2025 SUSTPA — Département Informatique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}