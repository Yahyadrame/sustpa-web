"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/types/auth.types";

interface RoleAssignerProps {
  userId: string;
  currentRole: AppRole;
  userName: string;
  // ✅ CORRIGÉ — onConfirm accepte responsibleLevel optionnel
  onConfirm: (
    userId: string,
    role: AppRole,
    responsibleLevel?: string,
  ) => Promise<void>;
}

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "🎓 Étudiant" },
  { value: "TEACHER", label: "👨‍🏫 Enseignant" },
  { value: "RESPONSIBLE", label: "🏛️ Responsable de filière" },
  { value: "JURY_MEMBER", label: "⚖️ Membre du jury" },
];

// ✅ NOUVEAU — options niveaux supervisés
const RESPONSIBLE_LEVEL_OPTIONS = [
  { value: "LICENCE", label: "🎓 Licence  (L1 / L2 / L3)" },
  { value: "MASTER", label: "📘 Master   (M1 / M2)" },
  { value: "DOCTORAL", label: "🔬 Doctorat" },
];

const ROLE_VARIANTS: Record<
  string,
  "default" | "primary" | "accent" | "warning" | "danger"
> = {
  ADMIN: "danger",
  STUDENT: "primary",
  TEACHER: "accent",
  RESPONSIBLE: "warning",
  JURY_MEMBER: "default",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  STUDENT: "Étudiant",
  TEACHER: "Enseignant",
  RESPONSIBLE: "Resp. filière",
  JURY_MEMBER: "Jury",
};

export function RoleAssigner({
  userId,
  currentRole,
  userName,
  onConfirm,
}: RoleAssignerProps) {
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>(currentRole);
  const [responsibleLevel, setResponsibleLevel] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isResponsible = newRole === "RESPONSIBLE";

  // ✅ Bouton Confirmer désactivé si RESPONSIBLE sans niveau sélectionné
  const canConfirm =
    newRole !== currentRole &&
    (newRole !== "RESPONSIBLE" || responsibleLevel !== "");

  const handleOpen = () => {
    setNewRole(currentRole);
    setResponsibleLevel("");
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (newRole === currentRole) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      await onConfirm(
        userId,
        newRole,
        isResponsible ? responsibleLevel : undefined,
      );
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 group"
        title="Modifier le rôle"
      >
        <Badge variant={ROLE_VARIANTS[currentRole] ?? "default"} dot>
          {ROLE_LABELS[currentRole] ?? currentRole}
        </Badge>
        <Shield className="h-3 w-3 text-slate-300 group-hover:text-primary-500 transition-colors" />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Modifier le rôle"
        description={`Vous modifiez le rôle de ${userName}. Cette action est enregistrée dans le journal d'audit.`}
        size="sm"
      >
        <div className="space-y-4">
          {/* Sélection du rôle */}
          <Select
            label="Nouveau rôle"
            options={ROLE_OPTIONS}
            value={newRole}
            onChange={(v) => {
              setNewRole(v as AppRole);
              if (v !== "RESPONSIBLE") setResponsibleLevel("");
            }}
          />

          {/* ✅ NOUVEAU — niveau supervisé affiché si RESPONSIBLE */}
          {isResponsible && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                🏛️ Niveau de filière supervisé
                <span className="text-red-500 ml-0.5">*</span>
              </p>
              <Select
                label="Niveau supervisé"
                placeholder="Sélectionner un niveau"
                options={RESPONSIBLE_LEVEL_OPTIONS}
                value={responsibleLevel}
                onChange={setResponsibleLevel}
              />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Ce responsable aura accès uniquement aux sujets et projets du
                niveau sélectionné.
              </p>
            </div>
          )}

          {/* Info multi-niveaux */}
          {isResponsible && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
              <span className="shrink-0 mt-0.5">ℹ️</span>
              Plusieurs responsables peuvent coexister à des niveaux différents
              (ex : un pour Licence, un pour Master).
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={loading}
              disabled={!canConfirm}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
