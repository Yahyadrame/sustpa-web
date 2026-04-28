"use client";

import { useState, useEffect, useCallback } from "react";
import { projectsApi } from "@/services/projects.service";
import { useToast } from "@/components/ui/toast";
import type { Project } from "@/types/project.types";

export function useProjects() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch {
      setError("Impossible de charger les projets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const approveProject = async (id: string) => {
    await projectsApi.approve(id);
    toast.success("Projet validé");
    fetchProjects();
  };

  const rejectProject = async (id: string, reason: string) => {
    await projectsApi.reject(id, reason);
    toast.success("Projet refusé");
    fetchProjects();
  };

  const archiveProject = async (id: string) => {
    await projectsApi.archive(id);
    toast.success("Projet archivé");
    fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    approveProject,
    rejectProject,
    archiveProject,
  };
}
