"use client";

import { Monitor, Sun, Moon, Type, Palette, LayoutGrid } from "lucide-react";
import { useSettingsStore } from "@/store/settings.store";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ThemeMode, AccentColor, FontSize } from "@/types/profile.types";

const THEMES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Clair", icon: <Sun className="h-4 w-4" /> },
  { value: "dark", label: "Sombre", icon: <Moon className="h-4 w-4" /> },
  { value: "system", label: "Système", icon: <Monitor className="h-4 w-4" /> },
];

const ACCENT_COLORS: {
  value: AccentColor;
  label: string;
  bg: string;
  ring: string;
}[] = [
  { value: "blue", label: "Bleu", bg: "bg-blue-500", ring: "ring-blue-500" },
  {
    value: "indigo",
    label: "Indigo",
    bg: "bg-indigo-500",
    ring: "ring-indigo-500",
  },
  {
    value: "violet",
    label: "Violet",
    bg: "bg-violet-500",
    ring: "ring-violet-500",
  },
  {
    value: "emerald",
    label: "Vert",
    bg: "bg-emerald-500",
    ring: "ring-emerald-500",
  },
  {
    value: "amber",
    label: "Ambre",
    bg: "bg-amber-500",
    ring: "ring-amber-500",
  },
];

const FONT_SIZES: { value: FontSize; label: string; preview: string }[] = [
  { value: "sm", label: "Petit", preview: "text-xs" },
  { value: "md", label: "Moyen", preview: "text-sm" },
  { value: "lg", label: "Grand", preview: "text-base" },
];

export function AppearanceSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const toast = useToast();

  const save = (patch: Parameters<typeof updateSettings>[0]) => {
    updateSettings(patch);
    toast.success("Apparence mise à jour");
  };

  return (
    <div className="space-y-6">
      {/* Thème */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary-600" />
            Thème
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => save({ theme: theme.value })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all text-sm font-medium",
                  settings.theme === theme.value
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50",
                )}
              >
                {theme.icon}
                {theme.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Couleur d'accentuation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary-600" />
            Couleur principale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                title={color.label}
                onClick={() => save({ accentColor: color.value })}
                className={cn(
                  "h-9 w-9 rounded-full transition-all",
                  color.bg,
                  settings.accentColor === color.value
                    ? `ring-2 ring-offset-2 ${color.ring} scale-110`
                    : "hover:scale-105 opacity-80 hover:opacity-100",
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Taille de police */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-4 w-4 text-primary-600" />
            Taille du texte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.value}
                onClick={() => save({ fontSize: fs.value })}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium",
                  fs.preview,
                  settings.fontSize === fs.value
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50",
                )}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mode compact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary-600" />
            Densité d&apos;affichage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { value: false, label: "Confortable", desc: "Plus d'espace" },
              { value: true, label: "Compact", desc: "Plus dense" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => save({ compactMode: opt.value })}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl border-2 transition-all text-left",
                  settings.compactMode === opt.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold",
                    settings.compactMode === opt.value
                      ? "text-primary-700"
                      : "text-slate-700",
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
