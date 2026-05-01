"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  User2,
  GraduationCap,
  BookOpen,
  KeyRound,
} from "lucide-react";

import { usersApi } from "@/services/users.service";
import { useAdminActions } from "@/hooks/use-admin";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RoleAssigner } from "@/components/admin/role-assigner";
import { UserStatusToggle } from "@/components/admin/user-status-toggle";
import { PasswordResetModal } from "@/components/admin/password-reset-modal";
import { formatDate } from "@/lib/utils";
import type { UserDetail } from "@/types/user.types";

// ─── Labels localisés ────────────────────────────────────────────────────────
const LEVEL_LABELS: Record<string, string> = {
  LICENCE_1: "Licence 1",
  LICENCE_2: "Licence 2",
  LICENCE_3: "Licence 3",
  MASTER_1: "Master 1",
  MASTER_2: "Master 2",
  DOCTORAT: "Doctorat",
};

const GRADE_LABELS: Record<string, string> = {
  ASSISTANT: "Assistant",
  MAITRE_ASSISTANT: "Maître Assistant",
  MAITRE_CONF: "Maître Conférences",
  PROFESSEUR: "Professeur",
};

const RESPONSIBLE_LEVEL_LABELS: Record<string, string> = {
  LICENCE: "Licence",
  MASTER: "Master",
  DOCTORAL: "Doctorat",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const { changeRole, forceResetPassword } = useAdminActions();

  const [{ user, loading }, setFetchState] = useState<{
    user: UserDetail | null;
    loading: boolean;
  }>({ user: null, loading: true });

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setFetchState((s) => ({ ...s, loading: true }));
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let active = true;

    void usersApi
      .getById(id)
      .then((data) => {
        if (active) setFetchState({ user: data, loading: false });
      })
      .catch(() => {
        if (active) setFetchState((s) => ({ ...s, loading: false }));
      });

    return () => {
      active = false;
    };
  }, [id, refreshKey]);

  if (!me || me.role !== "ADMIN") return null;
  if (loading || !user) return null;

  const isSelf = user.id === me.id;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Utilisateurs", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
        actions={
          <Button variant="secondary" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Carte profil ───────────────────────────────────────────── */}
        <Card className="flex flex-col items-center text-center py-8 gap-4">
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            src={user.avatarUrl ?? undefined}
            size="xl"
          />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Shield className="h-3 w-3" /> Rôle
            </p>
            <RoleAssigner
              userId={user.id}
              currentRole={user.role}
              userName={`${user.firstName} ${user.lastName}`}
              onConfirm={async (uid, role) => {
                await changeRole(uid, role, refresh);
              }}
            />
          </div>

          <Separator className="w-full" />

          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <User2 className="h-3 w-3" /> Statut du compte
            </p>
            <UserStatusToggle
              userId={user.id}
              isActive={user.isActive}
              userName={`${user.firstName} ${user.lastName}`}
              isSelf={isSelf}
              onToggle={async (uid, active) => {
                await usersApi.update(uid, { isActive: active });
                refresh();
              }}
            />
          </div>

          {!isSelf && (
            <>
              <Separator className="w-full" />
              <div className="flex flex-col items-center gap-2 w-full pt-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Sécurité
                </p>
                <PasswordResetModal
                  userId={user.id}
                  userName={`${user.firstName} ${user.lastName}`}
                  onReset={(uid) => forceResetPassword(uid)}
                />
              </div>
            </>
          )}
        </Card>

        {/* ─── Détails ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-primary-500" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <InfoRow label="Prénom" value={user.firstName} />
              <InfoRow label="Nom" value={user.lastName} />
              <InfoRow
                label="Email"
                value={
                  <a
                    href={`mailto:${user.email}`}
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" /> {user.email}
                  </a>
                }
              />
              <InfoRow
                label="Inscrit le"
                value={
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formatDate(user.createdAt)}
                  </span>
                }
              />
              <InfoRow
                label="1ère connexion"
                value={
                  user.isFirstLogin ? (
                    <Badge variant="warning">⏳ En attente</Badge>
                  ) : (
                    <Badge variant="success">✓ Connecté</Badge>
                  )
                }
              />
            </CardContent>
          </Card>

          {/* Profil étudiant */}
          {user.studentProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary-500" />
                  Profil étudiant
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <InfoRow
                  label="Matricule"
                  value={user.studentProfile.matricule ?? "—"}
                />
                <InfoRow
                  label="Niveau"
                  value={
                    LEVEL_LABELS[user.studentProfile.level ?? ""] ??
                    user.studentProfile.level ??
                    "—"
                  }
                />
                <InfoRow
                  label="Filière"
                  value={user.studentProfile.field ?? "—"}
                />
              </CardContent>
            </Card>
          )}

          {/* Profil enseignant */}
          {user.teacherProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-accent-500" />
                  Profil enseignant
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <InfoRow
                  label="Grade"
                  value={
                    GRADE_LABELS[user.teacherProfile.grade ?? ""] ??
                    user.teacherProfile.grade ??
                    "—"
                  }
                />
                <InfoRow
                  label="Spécialité"
                  value={user.teacherProfile.specialty ?? "—"}
                />
                <InfoRow
                  label="Plafond projets"
                  value={`${user.teacherProfile.maxProjects ?? 5} projets max`}
                />
                {user.teacherProfile.responsibleLevel && (
                  <InfoRow
                    label="Niveau supervisé"
                    value={
                      RESPONSIBLE_LEVEL_LABELS[
                        user.teacherProfile.responsibleLevel
                      ] ?? user.teacherProfile.responsibleLevel
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
