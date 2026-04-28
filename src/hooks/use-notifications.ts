"use client";

import { useEffect, useCallback, useState } from "react";
import { notificationsApi } from "@/services/notifications.service";
import { useNotificationsStore } from "@/store/notifications.store";

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    setNotifications,
    markAsRead,
    markAllAsRead,
    removeOne,
  } = useNotificationsStore();

  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, [setNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    markAsRead(id);
    await notificationsApi.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
    await notificationsApi.markAllAsRead();
  };

  const handleRemove = async (id: string) => {
    removeOne(id);
    await notificationsApi.remove(id);
  };

  // CORRECTION : vider le store d'un seul coup au lieu de boucler sur removeOne
  // Évite les closures stale et les incohérences de compteur unreadCount
  const handleRemoveAll = async () => {
    const ids = notifications.map((n) => n.id);
    // Optimistic update : vider immédiatement le store
    setNotifications([]);
    // Supprimer côté API en parallèle
    await Promise.allSettled(ids.map((id) => notificationsApi.remove(id)));
  };

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    removeNotif: handleRemove,
    removeAll: handleRemoveAll,
  };
}
