"use client";

import { useState, useEffect, useCallback } from "react";
import { profileApi } from "@/services/profile.service";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/toast";
import type { UserProfile } from "@/types/profile.types";

export function useProfile() {
  const toast = useToast();
  const setUser = useAuthStore((s) => s.setUser);

  /*
    CORRECTION : pattern "refresh trigger" — même règle que les autres hooks.
    setLoading(true) appelé dans fetchProfile() avant l'await = setState
    synchrone dans l'effect → interdit par le React Compiler.

    Solution :
    - { profile, loading } regroupés dans un seul state
    - refreshKey incrémenté par refresh() (appelé depuis des handlers)
    - l'effect ne contient aucun setState synchrone : tout dans .then()/.catch()
  */
  const [{ profile, loading }, setFetchState] = useState<{
    profile: UserProfile | null;
    loading: boolean;
  }>({ profile: null, loading: true });

  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setFetchState((s) => ({ ...s, loading: true }));
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let active = true;

    void profileApi
      .getMyProfile()
      .then((data) => {
        if (active) setFetchState({ profile: data, loading: false });
      })
      .catch(() => {
        if (active) setFetchState((s) => ({ ...s, loading: false }));
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const updateProfile = async (
    data: Parameters<typeof profileApi.updateMyProfile>[0],
  ) => {
    setSaving(true);
    try {
      const updated = await profileApi.updateMyProfile(data);
      setFetchState((s) => ({ ...s, profile: updated }));
      // Sync store auth — sidebar + header voient le changement immédiatement
      setUser({
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      });
      toast.success("Profil mis à jour");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setSaving(true);
    try {
      const { avatarUrl } = await profileApi.uploadAvatar(file);
      // Mise à jour locale du profil
      setFetchState((s) =>
        s.profile ? { ...s, profile: { ...s.profile, avatarUrl } } : s,
      );
      // Sync store auth → Avatar dans sidebar + header se met à jour en temps réel
      setUser({ ...useAuthStore.getState().user!, avatarUrl });
      toast.success("Avatar mis à jour");
      return avatarUrl;
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = async () => {
    setSaving(true);
    try {
      await profileApi.removeAvatar();
      // Mise à jour locale du profil
      setFetchState((s) =>
        s.profile ? { ...s, profile: { ...s.profile, avatarUrl: null } } : s,
      );
      // Sync store auth → retour aux initiales dans sidebar + header
      setUser({ ...useAuthStore.getState().user!, avatarUrl: null });
      toast.success("Avatar supprimé");
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    refetch: refresh,
    updateProfile,
    uploadAvatar,
    removeAvatar,
  };
}
