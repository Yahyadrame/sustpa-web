"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  BookOpen,
  FileCheck,
  Video,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Shield,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import type { AppRole } from "@/types/auth.types";

/* ─── Types ─────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: AppRole[];
  exact?: boolean;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  notifications?: number;
}

/* ─── Navigation config (inchangée) ─────────────────────────── */
const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        exact: true,
      },
    ],
  },
  {
    title: "Projets",
    items: [
      {
        label: "Mes projets",
        href: "/projects",
        icon: <FolderOpen className="h-4 w-4" />,
        roles: ["STUDENT", "TEACHER", "RESPONSIBLE"],
      },
      {
        label: "Bibliothèque sujets",
        href: "/subjects",
        icon: <BookOpen className="h-4 w-4" />,
        roles: ["STUDENT", "TEACHER", "RESPONSIBLE"],
      },
      {
        label: "Sujets en attente",
        href: "/subjects/pending",
        icon: <ClipboardList className="h-4 w-4" />,
        roles: ["RESPONSIBLE"],
      },
      {
        label: "Livrables",
        href: "/deliverables",
        icon: <FileCheck className="h-4 w-4" />,
        roles: ["STUDENT", "TEACHER", "RESPONSIBLE"],
      },
      {
        label: "Soutenances",
        href: "/defense",
        icon: <GraduationCap className="h-4 w-4" />,
        roles: ["TEACHER", "RESPONSIBLE", "JURY_MEMBER"],
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        label: "Sessions Meet",
        href: "/meet",
        icon: <Video className="h-4 w-4" />,
        roles: ["STUDENT", "TEACHER", "RESPONSIBLE"],
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: <Bell className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Rapports",
    items: [
      {
        label: "Statistiques",
        href: "/reports",
        icon: <BarChart3 className="h-4 w-4" />,
        roles: ["RESPONSIBLE", "ADMIN"],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Dashboard admin",
        href: "/admin/dashboard",
        icon: <Shield className="h-4 w-4" />,
        roles: ["ADMIN"],
      },
      {
        label: "Utilisateurs",
        href: "/admin/users",
        icon: <Users className="h-4 w-4" />,
        roles: ["ADMIN"],
      },
      {
        label: "Journal d'audit",
        href: "/admin/audit",
        icon: <ClipboardList className="h-4 w-4" />,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Système",
    items: [
      {
        label: "Paramètres",
        href: "/settings",
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
];

/* ─── Composant ─────────────────────────────────────────────── */
export function Sidebar({
  collapsed,
  onToggle,
  notifications = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  /* Filtrage RBAC — logique inchangée */
  const visibleGroups: NavGroup[] = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.roles || (user && item.roles.includes(user.role)),
    ),
  })).filter((g) => g.items.length > 0);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex h-16 items-center shrink-0 px-4",
          "border-b border-[#E8ECF0]",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        {/* Icône SUSTPA */}
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #1B8A5A, #156e48)",
            boxShadow: "0 4px 12px -2px rgb(27 138 90/0.35)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path
              d="M16 6.5C16 4.567 14.433 3 12.5 3H8C5.791 3 4 4.791 4 7c0 1.8 1.2 3.3 2.9 3.8L13 12.5c1.5.4 2.5 1.8 2.5 3.5 0 2-1.7 3.5-3.8 3.5H8c-1.933 0-3.5-1.567-3.5-3.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 text-[0.9375rem] leading-none tracking-[-0.03em] truncate">
              SUSTPA
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate tracking-[-0.01em]">
              Gestion académique
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5 no-scrollbar"
        aria-label="Navigation principale"
      >
        {visibleGroups.map((group, gi) => (
          <div key={gi} className={cn("space-y-0.5", gi > 0 && "mt-4")}>
            {/* Titre de groupe */}
            {group.title && !collapsed && (
              <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {group.title}
              </p>
            )}
            {group.title && collapsed && (
              <div className="mx-auto my-2 h-px w-6 bg-[#E8ECF0]" />
            )}

            {/* Items */}
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact);
              const showBadge =
                item.label === "Notifications" && notifications > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl text-[0.875rem] font-medium",
                    "transition-all duration-150 group",
                    collapsed
                      ? "justify-center h-10 w-10 mx-auto"
                      : "px-3 py-2.5",
                    active
                      ? "bg-[#edfaf4] text-primary-700"
                      : "text-slate-600 hover:bg-[#F6F8FA] hover:text-slate-900",
                  )}
                >
                  {/* Indicateur actif gauche */}
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-primary-600" />
                  )}

                  {/* Icône */}
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      active
                        ? "text-primary-600"
                        : "text-slate-400 group-hover:text-slate-600",
                    )}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  {!collapsed && (
                    <span className="flex-1 truncate tracking-[-0.01em]">
                      {item.label}
                    </span>
                  )}

                  {/* Badge notifications (expanded) */}
                  {!collapsed && showBadge && (
                    <span
                      className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                      style={{ background: "#fee2e2", color: "#dc2626" }}
                    >
                      {notifications > 99 ? "99+" : notifications}
                    </span>
                  )}

                  {/* Pastille rouge (collapsed) */}
                  {collapsed && showBadge && (
                    <span
                      className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"
                      style={{ boxShadow: "0 0 0 2px white" }}
                    />
                  )}

                  {/* Tooltip collapsed */}
                  {collapsed && (
                    <div
                      className={cn(
                        "pointer-events-none absolute left-full ml-3 z-50",
                        "hidden group-hover:flex items-center",
                        "rounded-xl bg-slate-900 px-2.5 py-1.5",
                        "text-xs font-medium text-white shadow-lg whitespace-nowrap",
                      )}
                      style={{ animation: "fadeIn 0.1s ease-out" }}
                    >
                      {item.label}
                      {/* Triangle */}
                      <span
                        className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                        style={{ borderRightColor: "#0f172a" }}
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Profil utilisateur ───────────────────────────────── */}
      {user && (
        <div
          className={cn(
            "shrink-0 border-t border-[#E8ECF0] p-3",
            collapsed && "flex justify-center",
          )}
        >
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-xl p-2",
              "transition-colors hover:bg-[#F6F8FA] group",
              collapsed && "justify-center",
            )}
            title={collapsed ? `${user.firstName} ${user.lastName}` : undefined}
          >
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              src={user.avatarUrl ?? undefined}
              size="sm"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[0.875rem] font-semibold text-slate-800 truncate tracking-[-0.02em] leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">
                  {user.email}
                </p>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* ── Bouton toggle collapse ───────────────────────────── */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        className={cn(
          "absolute -right-3 top-18 z-10",
          "flex h-6 w-6 items-center justify-center rounded-full",
          "bg-white text-slate-400",
          "transition-all duration-200",
          "hover:text-primary-600 hover:shadow-md",
        )}
        style={{
          border: "1px solid #E8ECF0",
          boxShadow: "0 1px 4px rgb(0 0 0/0.08)",
        }}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
