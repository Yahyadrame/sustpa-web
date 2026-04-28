"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";
import type { AuthUser } from "@/types/auth.types";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface MeResponse extends AuthUser {
  profile?: Record<string, unknown>;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, setUser, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(!user);

  /* ── Vérification session cookie côté serveur ── */
  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get<MeResponse>("/users/me");
        setUser({
          id:        data.id,
          firstName: data.firstName,
          lastName:  data.lastName,
          email:     data.email,
          role:      data.role,
          avatarUrl: data.avatarUrl,
        });
      } catch {
        /* Cookie invalide ou expiré → effacer store et rediriger */
        clearAuth();
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    void verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Loader de vérification ── */
  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F6F8FA" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Logo animé */}
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{
              background:  "linear-gradient(135deg, #1B8A5A, #156e48)",
              boxShadow:   "0 8px 24px -4px rgb(27 138 90/0.40)",
              animation:   "float 2s ease-in-out infinite",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M16 6.5C16 4.567 14.433 3 12.5 3H8C5.791 3 4 4.791 4 7c0 1.8 1.2 3.3 2.9 3.8L13 12.5c1.5.4 2.5 1.8 2.5 3.5 0 2-1.7 3.5-3.8 3.5H8c-1.933 0-3.5-1.567-3.5-3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Spinner */}
          <div
            className="h-5 w-5 rounded-full border-2 border-primary-600 border-t-transparent"
            style={{ animation: "spin 0.7s linear infinite" }}
          />
          <p
            className="text-sm text-slate-400 tracking-[-0.01em]"
          >
            Vérification de la session…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}