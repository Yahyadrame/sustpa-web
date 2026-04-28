"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { RoleAssigner } from "./role-assigner";
import { UserStatusToggle } from "./user-status-toggle";
import { PasswordResetModal } from "./password-reset-modal";
import { BulkActionsBar } from "./bulk-actions-bar";
import { cn } from "@/lib/utils";
import type { UserDetail } from "@/types/user.types";
import type { AppRole } from "@/types/auth.types";

interface UserTableProps {
  users: UserDetail[];
  currentUserId: string;
  onRoleChange: (userId: string, role: AppRole) => Promise<void>;
  onStatusToggle: (userId: string, isActive: boolean) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onBulkActivate: (ids: string[]) => void;
  onBulkDeactivate: (ids: string[]) => void;
  onBulkExport: (ids: string[]) => void;
  onBulkEmail: (
    ids: string[],
    subject: string,
    message: string,
  ) => Promise<void>;
  onRefresh: () => void;
}

export function UserTable({
  users,
  currentUserId,
  onRoleChange,
  onStatusToggle,
  onResetPassword,
  onBulkActivate,
  onBulkDeactivate,
  onBulkExport,
  onBulkEmail,
  onRefresh,
}: UserTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // CORRECTION : ternaire comme instruction → if/else
      // Le ternaire `a ? b : c` sans assignation est une expression pure,
      // pas un statement valide selon @typescript-eslint/no-unused-expressions
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  };

  const selectedIds = Array.from(selected);
  const allSelected = selected.size === users.length && users.length > 0;

  return (
    <>
      <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/60">
                <th className="w-10 px-4 py-3">
                  <label htmlFor="select-all" className="sr-only">
                    {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  </label>
                  <input
                    id="select-all"
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    title={
                      allSelected ? "Tout désélectionner" : "Tout sélectionner"
                    }
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  1ère connexion
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Inscrit le
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isSelected = selected.has(u.id);
                const isSelf = u.id === currentUserId;
                const checkboxId = `select-user-${u.id}`;

                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "transition-colors hover:bg-slate-50/60",
                      isSelected && "bg-primary-50/40",
                    )}
                  >
                    <td className="px-4 py-3">
                      <label htmlFor={checkboxId} className="sr-only">
                        Sélectionner {u.firstName} {u.lastName}
                      </label>
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(u.id)}
                        title={`Sélectionner ${u.firstName} ${u.lastName}`}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={u.firstName}
                          lastName={u.lastName}
                          src={u.avatarUrl ?? undefined}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {u.firstName} {u.lastName}
                            {isSelf && (
                              <span className="ml-1.5 text-xs text-primary-500 font-normal">
                                (vous)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {u.role !== "ADMIN" ? (
                        <RoleAssigner
                          userId={u.id}
                          currentRole={u.role}
                          userName={`${u.firstName} ${u.lastName}`}
                          onConfirm={async (id, role) => {
                            await onRoleChange(id, role);
                            onRefresh();
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <UserStatusToggle
                        userId={u.id}
                        isActive={u.isActive}
                        userName={`${u.firstName} ${u.lastName}`}
                        isSelf={isSelf}
                        onToggle={async (id, active) => {
                          await onStatusToggle(id, active);
                          onRefresh();
                        }}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          u.isFirstLogin
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700",
                        )}
                      >
                        {u.isFirstLogin ? "⏳ En attente" : "✓ Connecté"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Voir le profil"
                          aria-label={`Voir le profil de ${u.firstName} ${u.lastName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {!isSelf && (
                          <PasswordResetModal
                            userId={u.id}
                            userName={`${u.firstName} ${u.lastName}`}
                            onReset={async (id) => {
                              await onResetPassword(id);
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>
            {users.length} utilisateur{users.length > 1 ? "s" : ""}
          </span>
          {selected.size > 0 && (
            <span className="text-primary-600 font-medium">
              {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelect={() => setSelected(new Set())}
        onActivate={() => {
          onBulkActivate(selectedIds);
          setSelected(new Set());
          onRefresh();
        }}
        onDeactivate={() => {
          onBulkDeactivate(selectedIds);
          setSelected(new Set());
          onRefresh();
        }}
        onExportCSV={() => onBulkExport(selectedIds)}
        onSendEmail={async (subject, message) => {
          await onBulkEmail(selectedIds, subject, message);
        }}
      />
    </>
  );
}
