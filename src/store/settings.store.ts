import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  ThemeMode,
  AccentColor,
  FontSize,
} from "@/types/profile.types";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  accentColor: "blue",
  fontSize: "md",
  notifEmail: true,
  notifInApp: true,
  notifDeadline: true,
  notifValidation: true,
  notifMeet: true,
  language: "fr",
  compactMode: false,
};

interface SettingsState {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  // UTILISATION : méthodes de mise à jour ciblées — typage strict via
  // ThemeMode, AccentColor et FontSize évite de passer une string arbitraire
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: FontSize) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (patch) =>
        set((state) => ({
          settings: { ...state.settings, ...patch },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      setTheme: (theme: ThemeMode) =>
        set((state) => ({ settings: { ...state.settings, theme } })),

      setAccentColor: (accentColor: AccentColor) =>
        set((state) => ({ settings: { ...state.settings, accentColor } })),

      setFontSize: (fontSize: FontSize) =>
        set((state) => ({ settings: { ...state.settings, fontSize } })),
    }),
    {
      name: "sustpa-settings",
      version: 1,
    },
  ),
);
