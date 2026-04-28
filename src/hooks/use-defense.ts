"use client";

import { useState, useEffect, useCallback } from "react";
import { defenseApi } from "@/services/defense.service";
import { useToast } from "@/components/ui/toast";
import type { Defense, AssignJuryPayload } from "@/types/defense.types";

export function useDefense() {
  const toast = useToast();
  const [defenses, setDefenses] = useState<Defense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await defenseApi.getAll();
      setDefenses(data);
    } catch {
      setError("Impossible de charger les soutenances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDefenses();
  }, [fetchDefenses]);

  const createDefense = async (data: {
    projectId: string;
    scheduledAt: string;
    room: string;
  }) => {
    await defenseApi.create(data);
    toast.success("Soutenance planifiée");
    await fetchDefenses();
  };

  // ✅ MODIFIÉ — payload typé AssignJuryPayload (members[] avec juryRole)
  const assignJury = async (defenseId: string, payload: AssignJuryPayload) => {
    await defenseApi.assignJury(defenseId, payload);
    toast.success("Jury constitué");
    await fetchDefenses();
  };

  const gradeDefense = async (
    defenseId: string,
    data: { grade: number; remarks?: string; comment?: string },
  ) => {
    await defenseApi.grade(defenseId, data);
    toast.success("Note enregistrée");
    await fetchDefenses();
  };

  return {
    defenses,
    loading,
    error,
    refetch: fetchDefenses,
    createDefense,
    assignJury,
    gradeDefense,
  };
}

// Hook pour une soutenance individuelle
export function useDefenseById(id: string) {
  const [defense, setDefense] = useState<Defense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefense = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await defenseApi.getById(id);
      setDefense(data);
    } catch {
      setError("Soutenance introuvable");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDefense();
  }, [fetchDefense]);

  return { defense, loading, error, refetch: fetchDefense };
}
