"use client";

import { useState, useEffect, useCallback } from "react";
import { meetApi } from "@/services/meet.service";
import { useToast } from "@/components/ui/toast";
import type { MeetSession } from "@/types/meet.types";

export function useMeet() {
  const toast = useToast();
  const [sessions, setSessions] = useState<MeetSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await meetApi.getAll();
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (data: Parameters<typeof meetApi.create>[0]) => {
    const session = await meetApi.create(data);
    toast.success("Session créée", "L'étudiant a été notifié par email.");
    // CORRECTION : await pour garantir la liste à jour après l'action
    await fetchSessions();
    return session;
  };

  const confirmSession = async (id: string) => {
    await meetApi.confirm(id);
    toast.success("Disponibilité confirmée");
    await fetchSessions();
  };

  const submitReport = async (id: string, report: string) => {
    await meetApi.submitReport(id, report);
    toast.success("Compte-rendu enregistré et archivé");
    await fetchSessions();
  };

  const deleteSession = async (id: string) => {
    await meetApi.delete(id);
    toast.success("Session supprimée");
    await fetchSessions();
  };

  return {
    sessions,
    loading,
    refetch: fetchSessions,
    createSession,
    confirmSession,
    submitReport,
    deleteSession,
  };
}
