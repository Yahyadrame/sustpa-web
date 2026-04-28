"use client";

import { useProfile } from "@/hooks/use-profile";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileStats } from "@/components/profile/profile-stats";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const {
    profile,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    removeAvatar,
  } = useProfile();

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mon profil" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : avatar + stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              {/*
                CORRECTION : name={`${firstName} ${lastName}`} remplacé par
                firstName + lastName séparément — AvatarUpload n'accepte plus
                la prop name depuis la correction du composant.
              */}
              <AvatarUpload
                currentUrl={profile.avatarUrl}
                firstName={profile.firstName}
                lastName={profile.lastName}
                onUpload={uploadAvatar}
                onRemove={removeAvatar}
                saving={saving}
              />
              <div className="mt-4 text-center">
                <p className="text-base font-bold text-slate-900">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
              </div>
            </CardContent>
          </Card>

          <ProfileStats profile={profile} />
        </div>

        {/* Colonne droite : formulaire */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <ProfileForm
                profile={profile}
                saving={saving}
                onSubmit={updateProfile}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
