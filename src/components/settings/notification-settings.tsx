"use client";

import {
  Bell,
  Mail,
  Monitor,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useSettingsStore } from "@/store/settings.store";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ToggleRowProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({
  id,
  icon,
  label,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          {/*
            CORRECTION 1 : <label htmlFor> associé au checkbox natif —
            fournit un texte discernable et résout le warning d'accessibilité
          */}
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-800 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/*
        CORRECTION 2 : aria-checked={expression} sur un <button> remplacé
        par un <input type="checkbox"> natif caché + visuel custom.
        Le checkbox natif gère checked/aria nativement sans ARIA dynamique.
        CORRECTION 3 : title ajouté sur le label visuel pour le bouton.
      */}
      <label
        htmlFor={id}
        title={checked ? `Désactiver : ${label}` : `Activer : ${label}`}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`
            absolute inset-0 rounded-full border-2 border-transparent
            transition-colors duration-200
            focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
            ${checked ? "bg-primary-600" : "bg-slate-200"}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white
              shadow-md ring-0 transition-transform duration-200 mt-px
              ${checked ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </span>
      </label>
    </div>
  );
}

export function NotificationSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const toast = useToast();

  const save = (patch: Parameters<typeof updateSettings>[0]) => {
    updateSettings(patch);
    toast.success("Préférences sauvegardées");
  };

  return (
    <div className="space-y-6">
      {/* Canaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary-600" />
            Canaux de notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleRow
            id="notif-inapp"
            icon={<Monitor className="h-4 w-4" />}
            label="Notifications in-app"
            description="Reçevez des alertes en temps réel dans l'interface."
            checked={settings.notifInApp}
            onChange={(v) => save({ notifInApp: v })}
          />
          {/* CORRECTION 4 : Separator utilisé entre les lignes */}
          <Separator />
          <ToggleRow
            id="notif-email"
            icon={<Mail className="h-4 w-4" />}
            label="Notifications par e-mail"
            description="Reçevez des emails pour les événements importants."
            checked={settings.notifEmail}
            onChange={(v) => save({ notifEmail: v })}
          />
        </CardContent>
      </Card>

      {/* Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary-600" />
            Types de notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleRow
            id="notif-deadline"
            icon={<Clock className="h-4 w-4" />}
            label="Alertes d'échéances"
            description="Rappels J-7 et J-1 avant les dates limites."
            checked={settings.notifDeadline}
            onChange={(v) => save({ notifDeadline: v })}
          />
          <Separator />
          <ToggleRow
            id="notif-validation"
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Validations de livrables"
            description="Notifications lors des approbations ou révisions."
            checked={settings.notifValidation}
            onChange={(v) => save({ notifValidation: v })}
          />
          <Separator />
          <ToggleRow
            id="notif-meet"
            icon={<Calendar className="h-4 w-4" />}
            label="Sessions Meet"
            description="Rappels de sessions planifiées."
            checked={settings.notifMeet}
            onChange={(v) => save({ notifMeet: v })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
