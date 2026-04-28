"use client";

import { useState, useEffect, useCallback } from "react";
import { projectsApi } from "@/services/projects.service";
import { useToast } from "@/components/ui/toast";
import type {
  ProjectSubject,
  PendingSubjectItem,
  ValidateSubjectPayload,
} from "@/types/project.types";

export function useSubjects() {
  const toast = useToast();
  const [subjects, setSubjects] = useState<ProjectSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getAllSubjects();
      setSubjects(data);
    } catch {
      setError("Impossible de charger les sujets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const applyToSubject = async (subjectId: string, message?: string) => {
    await projectsApi.apply(subjectId, message);
    toast.success("Candidature envoyée");
    // CORRECTION : refetch après candidature pour mettre à jour myApplicationStatus
    await fetchSubjects();
  };

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
    applyToSubject,
  };
}

export function usePendingSubjects() {
  const toast = useToast();
  const [pendingSubjects, setPendingSubjects] = useState<PendingSubjectItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getPendingSubjects();
      setPendingSubjects(data);
    } catch {
      setError("Impossible de charger les sujets en attente");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const validateSubject = async (
    subjectId: string,
    payload: ValidateSubjectPayload,
  ) => {
    const result = await projectsApi.validateSubject(subjectId, payload);
    toast.success(result.message);
    await fetchPending();
  };

  return {
    pendingSubjects,
    loading,
    error,
    refetch: fetchPending,
    validateSubject,
  };
}
