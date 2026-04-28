"use client";

import { useState } from "react";
import { UserCheck, UserX } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserStatusToggleProps {
  userId: string;
  isActive: boolean;
  userName: string;
  isSelf: boolean;
  onToggle: (userId: string, isActive: boolean) => Promise<void>;
}

export function UserStatusToggle({
  userId,
  isActive,
  userName,
  isSelf,
  onToggle,
}: UserStatusToggleProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onToggle(userId, !isActive);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (isSelf) {
    return (
      <Badge variant="success" dot>
        Actif (vous)
      </Badge>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
          isActive
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        )}
        title={isActive ? "Désactiver ce compte" : "Activer ce compte"}
      >
        {isActive ? (
          <>
            <UserCheck className="h-3 w-3" /> Actif
          </>
        ) : (
          <>
            <UserX className="h-3 w-3" /> Inactif
          </>
        )}
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={isActive ? "Désactiver le compte" : "Activer le compte"}
        description={
          isActive
            ? `Désactiver le compte de ${userName} l'empêchera de se connecter.`
            : `Activer le compte de ${userName} lui permettra de se connecter.`
        }
        size="sm"
      >
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant={isActive ? "danger" : "primary"}
            isLoading={loading}
            onClick={handleConfirm}
          >
            {isActive ? "Désactiver" : "Activer"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
