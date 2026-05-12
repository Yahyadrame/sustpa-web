"use client";

import { useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { defenseApi } from "@/services/defense.service";

interface EditDefenseModalProps {
  open: boolean;
  onClose: () => void;
  defenseId: string;
  initialDate: string;
  initialRoom: string;
  onSuccess: () => void;
}

export function EditDefenseModal({
  open,
  onClose,
  defenseId,
  initialDate,
  initialRoom,
  onSuccess,
}: EditDefenseModalProps) {
  const [scheduledAt, setScheduledAt] = useState(
    new Date(initialDate).toISOString().slice(0, 16)
  );
  const [room, setRoom] = useState(initialRoom);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await defenseApi.update(defenseId, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        room,
      });
      success("Soutenance modifiée");
      onSuccess();
      onClose();
    } catch (err) {
      error("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Modifier la soutenance"
      description="Mettez à jour la date et le lieu de la soutenance."
      size="sm"
    >
      <div className="space-y-4">
        <Input
          type="datetime-local"
          label="Date et heure"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <Input
          label="Salle"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
      </div>
      <DialogFooter className="mt-6">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} isLoading={loading}>
          Enregistrer
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
