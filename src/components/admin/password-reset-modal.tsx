"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PasswordResetModalProps {
  userId: string;
  userName: string;
  onReset: (userId: string) => Promise<void>;
}

export function PasswordResetModal({
  userId,
  userName,
  onReset,
}: PasswordResetModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await onReset(userId);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
        title="Réinitialiser le mot de passe"
      >
        <KeyRound className="h-4 w-4" />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Réinitialiser le mot de passe"
        description={`Le mot de passe de ${userName} sera réinitialisé à password123 et un email lui sera envoyé.`}
        size="sm"
      >
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 mb-4">
          <strong>Mot de passe temporaire :</strong> password123
          <br />
          L&apos;utilisateur sera forcé de le changer à sa prochaine connexion.
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="danger" isLoading={loading} onClick={handleReset}>
            <KeyRound className="h-4 w-4" />
            Réinitialiser
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
