"use client";

import { useState, useEffect, useCallback } from "react";
import { deliverablesApi } from "@/services/deliverables.service";
import { useToast } from "@/components/ui/toast";
import type { Deliverable } from "@/types/deliverable.types";

export function useDeliverables() {
  const toast = useToast();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDeliverables = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deliverablesApi.getAll();
      setDeliverables(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  const upload = async (
    file: File,
    milestoneId: string,
    projectId: string,
    title: string,
  ) => {
    setUploading(true);
    try {
      const result = await deliverablesApi.upload(
        file,
        milestoneId,
        projectId,
        title,
      );
      toast.success("Livrable déposé", `Version ${result.version} créée`);
      fetchDeliverables();
      return result;
    } finally {
      setUploading(false);
    }
  };

  const approve = async (id: string, comment?: string) => {
    await deliverablesApi.review(id, "APPROVED", comment);
    toast.success("Livrable approuvé");
    fetchDeliverables();
  };

  const requestRevision = async (id: string, comment: string) => {
    await deliverablesApi.review(id, "REVISION_REQUESTED", comment);
    toast.warning("Révision demandée");
    fetchDeliverables();
  };

  return {
    deliverables,
    loading,
    uploading,
    refetch: fetchDeliverables,
    upload,
    approve,
    requestRevision,
  };
}
