"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, UserCheck, UserX, Shield } from "lucide-react";

import { useUsers } from "@/hooks/use-users";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

// ✅ CORRIGÉ — libellé lisible pour RESPONSIBLE
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  STUDENT: "Étudiant",
  TEACHER: "Enseignant",
  RESPONSIBLE: "Resp. filière",
  JURY_MEMBER: "Jury",
};

const ROLE_VARIANTS: Record<
  string,
  "default" | "primary" | "accent" | "warning" | "danger"
> = {
  ADMIN: "danger",
  STUDENT: "primary",
  TEACHER: "accent",
  RESPONSIBLE: "warning",
  JURY_MEMBER: "default",
};

export default function UsersAdminPage() {
  const [search, setSearch] = useState("");
  const { users, loading, toggleUserStatus } = useUsers(search);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestion des utilisateurs"
        description={`${users.length} compte${users.length > 1 ? "s" : ""} enregistré${users.length > 1 ? "s" : ""}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Administration" },
          { label: "Utilisateurs" },
        ]}
        actions={
          <Link href="/admin/users/new">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              Créer un compte
            </Button>
          </Link>
        }
      />

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Nom, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={7} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="Aucun utilisateur"
          description="Créez le premier compte utilisateur."
          action={
            <Link href="/admin/users/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" /> Créer un compte
              </Button>
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>1ère connexion</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar
                      firstName={u.firstName}
                      lastName={u.lastName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary-700 transition-colors">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {u.email}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANTS[u.role] ?? "default"} dot>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "success" : "danger"} dot>
                    {u.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isFirstLogin ? "warning" : "success"} dot>
                    {u.isFirstLogin ? "En attente" : "Connecté"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  <Tooltip content={u.isActive ? "Désactiver" : "Activer"}>
                    <button
                      onClick={() => toggleUserStatus(u.id, !u.isActive)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      aria-label={u.isActive ? "Désactiver" : "Activer"}
                    >
                      {u.isActive ? (
                        <UserX className="h-4 w-4 text-red-500" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      )}
                    </button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
