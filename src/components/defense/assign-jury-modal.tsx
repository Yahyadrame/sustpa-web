"use client";

import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { usersApi } from "@/services/users.service";
import { cn } from "@/lib/utils";
import type { UserDetail } from "@/types/user.types";
import type { JuryRole, AssignJuryPayload } from "@/types/defense.types";

interface SelectedMember {
  teacherId: string;
  juryRole: JuryRole;
}

interface AssignJuryModalProps {
  open: boolean;
  onClose: () => void;
  defenseId: string;
  onSubmit: (defenseId: string, payload: AssignJuryPayload) => Promise<void>;
  supervisorId?: string | null;
}

/* ENCADRANT exclu des options — auto-inséré par le backend */
const JURY_ROLE_OPTIONS: { value: JuryRole; label: string }[] = [
  { value: "PRESIDENT", label: "Président" },
  { value: "RAPPORTEUR", label: "Rapporteur" },
  { value: "EXAMINATEUR", label: "Examinateur" },
];

const JURY_ROLE_CFG: Record<
  JuryRole,
  { bg: string; text: string; border: string }
> = {
  PRESIDENT: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  RAPPORTEUR: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  EXAMINATEUR: { bg: "#F6F8FA", text: "#64748b", border: "#E8ECF0" },
  ENCADRANT: { bg: "#edfaf4", text: "#1B8A5A", border: "#a8e9cb" },
};

export function AssignJuryModal({
  open,
  onClose,
  defenseId,
  onSubmit,
  supervisorId,
}: AssignJuryModalProps) {
  const [teachers, setTeachers] = useState<UserDetail[]>([]);
  const [selected, setSelected] = useState<SelectedMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    void usersApi
      .getTeachers()
      .then((data) => {
        if (active) setTeachers(data as UserDetail[]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  /* Exclure l'encadrant de la liste — logique inchangée */
  const availableTeachers = teachers.filter((t) => t.id !== supervisorId);

  const toggleTeacher = (id: string) => {
    setSelected((prev) => {
      const exists = prev.find((m) => m.teacherId === id);
      if (exists) return prev.filter((m) => m.teacherId !== id);
      return [...prev, { teacherId: id, juryRole: "EXAMINATEUR" }];
    });
  };

  const setRole = (teacherId: string, juryRole: JuryRole) => {
    if (juryRole === "PRESIDENT") {
      const existing = selected.find(
        (m) => m.juryRole === "PRESIDENT" && m.teacherId !== teacherId,
      );
      if (existing) return;
    }
    setSelected((prev) =>
      prev.map((m) => (m.teacherId === teacherId ? { ...m, juryRole } : m)),
    );
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };
  const presidentCount = selected.filter(
    (m) => m.juryRole === "PRESIDENT",
  ).length;
  const isValid = selected.length > 0 && presidentCount === 1;
  const validationMsg =
    selected.length > 0 && presidentCount === 0
      ? "Désignez un Président de jury"
      : presidentCount > 1
        ? "Un seul Président autorisé"
        : null;

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await onSubmit(defenseId, { members: selected });
      setSelected([]);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Affecter le jury"
      description="Sélectionnez jusqu'à 5 membres et attribuez leur rôle. L'encadrant est ajouté automatiquement."
      size="md"
    >
      <div className="space-y-4">
        {/* Membres sélectionnés */}
        {selected.length > 0 && (
          <div
            className="space-y-2 p-3 rounded-xl"
            style={{ background: "#edfaf4", border: "1px solid #a8e9cb" }}
          >
            <p className="text-xs font-semibold text-primary-700 mb-1">
              Sélectionnés ({selected.length}/5)
            </p>
            {selected.map((m) => {
              const t = availableTeachers.find((x) => x.id === m.teacherId);
              const fullName = t ? `${t.firstName} ${t.lastName}` : m.teacherId;
              const presidentTaken = selected.some(
                (x) =>
                  x.juryRole === "PRESIDENT" && x.teacherId !== m.teacherId,
              );
              const roleCfg = JURY_ROLE_CFG[m.juryRole];

              return (
                <div
                  key={m.teacherId}
                  className="flex items-center gap-2 bg-white rounded-xl px-3 py-2"
                  style={{ border: "1px solid #a8e9cb" }}
                >
                  <span className="flex-1 text-xs font-medium text-slate-700 truncate">
                    {fullName}
                  </span>
                  <select
                    value={m.juryRole}
                    onChange={(e) =>
                      setRole(m.teacherId, e.target.value as JuryRole)
                    }
                    className="text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none border cursor-pointer"
                    style={{
                      background: roleCfg.bg,
                      color: roleCfg.text,
                      borderColor: roleCfg.border,
                    }}
                  >
                    {JURY_ROLE_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.value === "PRESIDENT" && presidentTaken}
                      >
                        {opt.value === "PRESIDENT" && presidentTaken
                          ? "Président (déjà assigné)"
                          : opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleTeacher(m.teacherId)}
                    aria-label="Retirer"
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {validationMsg && (
              <p
                className="text-xs font-semibold pt-1"
                style={{ color: "#b45309" }}
              >
                ⚠ {validationMsg}
              </p>
            )}
          </div>
        )}

        {/* Liste enseignants */}
        <div className="max-h-72 overflow-y-auto space-y-1 -mx-1 px-1 no-scrollbar">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                >
                  <div className="h-9 w-9 rounded-full bg-[#E8ECF0] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-32 bg-[#E8ECF0] rounded" />
                    <div className="h-3 w-24 bg-[#E8ECF0] rounded" />
                  </div>
                </div>
              ))
            : availableTeachers.map((t) => {
                const isSelected = selected.some((m) => m.teacherId === t.id);
                const isDisabled = !isSelected && selected.length >= 5;
                const fullName = `${t.firstName} ${t.lastName}`;

                return (
                  <label
                    key={t.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      isDisabled
                        ? "opacity-40 cursor-not-allowed border-transparent"
                        : "cursor-pointer",
                      isSelected
                        ? "border-primary-200"
                        : !isDisabled
                          ? "border-transparent hover:bg-[#F6F8FA] hover:border-[#E8ECF0]"
                          : "border-transparent",
                    )}
                    style={isSelected ? { background: "#edfaf4" } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleTeacher(t.id)}
                      className="sr-only"
                    />
                    <Avatar
                      firstName={t.firstName}
                      lastName={t.lastName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 tracking-[-0.01em]">
                        {fullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {t.email}
                      </p>
                    </div>
                    <div
                      className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={
                        isSelected
                          ? { background: "#1B8A5A", borderColor: "#1B8A5A" }
                          : { borderColor: "#C8CDD5" }
                      }
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 12 12"
                          className="h-3 w-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <polyline points="1.5,6 5,9.5 10.5,2.5" />
                        </svg>
                      )}
                    </div>
                  </label>
                );
              })}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            isLoading={submitting}
          >
            <Users className="h-4 w-4" />
            Affecter {selected.length > 0 ? `(${selected.length})` : ""}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
