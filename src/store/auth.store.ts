import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearAuth: () => {
        // ✅ Plus de localStorage pour les tokens — gérés via cookies httpOnly
        // On efface uniquement les données utilisateur du store
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "sustpa-auth",
      // ✅ Persiste uniquement le profil utilisateur (jamais les tokens)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
