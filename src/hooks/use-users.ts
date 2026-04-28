"use client";

import { useState, useEffect, useCallback } from "react";
import { usersApi } from "@/services/users.service";
import { useToast } from "@/components/ui/toast";
import type { UserDetail } from "@/types/user.types";

export function useUsers(search?: string) {
  const toast = useToast();
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll(search);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    await usersApi.update(id, { isActive });
    toast.success(isActive ? "Compte activé" : "Compte désactivé");
    fetchUsers();
  };

  return { users, loading, refetch: fetchUsers, toggleUserStatus };
}
