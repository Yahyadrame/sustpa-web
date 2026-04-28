"use client";

import { useRouter }       from "next/navigation";
import { useAuthStore }    from "@/store/auth.store";
import api                 from "@/lib/api";
import { profileApi }      from "@/services/profile.service";
import type {
  LoginPayload,
  AuthResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth.types";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);

    // ✅ CORRIGÉ — plus de localStorage pour les tokens
    // Les cookies httpOnly sont posés automatiquement par la réponse NestJS
    // On stocke uniquement le profil utilisateur dans le store Zustand

    setUser(data.user);

    // Enrichissement avatar en arrière-plan — non bloquant
    void profileApi
      .getMyProfile()
      .then((profile) => {
        setUser({
          id:        profile.id,
          firstName: profile.firstName,
          lastName:  profile.lastName,
          email:     profile.email,
          role:      profile.role,
          avatarUrl: profile.avatarUrl,
        });
      })
      .catch(() => {
        // non bloquant
      });

    if (data.requiresPasswordChange) {
      router.push("/change-password");
      return;
    }

    const routes: Record<string, string> = {
      ADMIN:        "/admin/dashboard",
      STUDENT:      "/dashboard",
      TEACHER:      "/dashboard",
      RESPONSIBLE:  "/dashboard",
      JURY_MEMBER:  "/dashboard",
    };
    router.push(routes[data.user.role] ?? "/dashboard");
  };

  const verifyOtp = async (
    payload: VerifyOtpPayload,
  ): Promise<VerifyOtpResponse> => {
    const { data } = await api.post<VerifyOtpResponse>(
      "/auth/verify-otp",
      payload,
    );
    return data;
  };

  const resendOtp = async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/auth/resend-otp");
    return data;
  };

  const changePassword = async (
    currentPassword: string,
    newPassword:     string,
  ) => {
    await api.post("/auth/change-password", { currentPassword, newPassword });
    // ✅ clearAuth efface le store Zustand — les cookies sont effacés
    // par le backend lors du prochain appel logout ou expiration naturelle
    clearAuth();
    router.push("/login?changed=true");
  };

  const logout = async () => {
    try {
      // ✅ Le backend efface les cookies httpOnly dans cette requête
      await api.post("/auth/logout");
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const forgotPassword = async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (token: string, password: string) => {
    await api.post("/auth/reset-password", { token, password });
  };

  return {
    user,
    isAuthenticated,
    login,
    verifyOtp,
    resendOtp,
    changePassword,
    logout,
    forgotPassword,
    resetPassword,
  };
}