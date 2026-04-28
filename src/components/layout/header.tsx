"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  LogOut,
  User,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";
import { NotificationBell } from "@/components/notifications/notification-bell";

/* ─── Labels rôles ─────────────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  STUDENT: "Étudiant",
  TEACHER: "Enseignant",
  RESPONSIBLE: "Responsable de filière",
  JURY_MEMBER: "Membre du jury",
};

/* ─── Breadcrumb ────────────────────────────────────────────── */
const LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  projects: "Projets",
  subjects: "Sujets",
  deliverables: "Livrables",
  defense: "Soutenances",
  meet: "Sessions Meet",
  notifications: "Notifications",
  reports: "Statistiques",
  users: "Utilisateurs",
  admin: "Administration",
  settings: "Paramètres",
  profile: "Profil",
  new: "Nouveau",
  audit: "Journal d'audit",
  pending: "En attente",
  head: "Responsable",
};

function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label:
      LABELS[seg] ??
      (seg.length > 20
        ? seg.slice(0, 8) + "…"
        : seg.charAt(0).toUpperCase() + seg.slice(1)),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const breadcrumb = useBreadcrumb();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  if (!user) return null;

  const menuItems: DropdownItem[] = [
    {
      label: "Mon profil",
      icon: <User className="h-4 w-4" />,
      href: "/profile",
    },
    {
      label: "Paramètres",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
    },
    { separator: true },
    {
      label: "Déconnexion",
      icon: <LogOut className="h-4 w-4" />,
      onClick: logout,
      variant: "danger",
    },
  ];

  return (
    <header
      className="flex h-16 items-center justify-between px-4 lg:px-6 shrink-0"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E8ECF0",
        boxShadow: "0 1px 0 0 #E8ECF0",
      }}
    >
      {/* ── GAUCHE : burger + breadcrumb ───────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Burger mobile */}
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Ouvrir le menu"
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              "text-slate-500 hover:bg-[#F6F8FA] hover:text-slate-700",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Breadcrumb style OripioFin */}
        <nav
          aria-label="Fil d'Ariane"
          className="hidden sm:flex items-center gap-1 text-sm min-w-0"
        >
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              )}
              {crumb.isLast ? (
                <span className="font-semibold text-slate-800 truncate max-w-40 tracking-[-0.02em]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-slate-400 hover:text-slate-600 transition-colors truncate max-w-30 tracking-[-0.01em]"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* ── DROITE : search + notif + user ─────────────────── */}
      <div className="flex items-center gap-2">
        {/* Barre de recherche style OripioFin */}
        <div
          className={cn(
            "relative hidden md:flex items-center rounded-xl transition-all duration-200",
            searchFocused ? "w-64" : "w-52",
          )}
          style={{
            background: "#F6F8FA",
            border: searchFocused
              ? "1.5px solid #1B8A5A"
              : "1.5px solid #E8ECF0",
            boxShadow: searchFocused ? "0 0 0 3px rgb(27 138 90/0.10)" : "none",
          }}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Rechercher…"
            aria-label="Rechercher"
            className={cn(
              "w-full bg-transparent py-2.5 pl-9 pr-3",
              "text-sm text-slate-700 placeholder:text-slate-400",
              "focus:outline-none",
              "font-[DM_Sans,system-ui,sans-serif] tracking-[-0.01em]",
            )}
          />
        </div>

        {/* Cloche notifications */}
        <NotificationBell />

        {/* Séparateur vertical */}
        <div
          className="hidden lg:block h-7 w-px mx-0.5"
          style={{ background: "#E8ECF0" }}
          aria-hidden="true"
        />

        {/* Dropdown utilisateur style OripioFin */}
        <DropdownMenu
          trigger={
            <button
              type="button"
              aria-label="Menu utilisateur"
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5",
                "transition-all duration-150 group",
                "hover:bg-[#F6F8FA]",
              )}
            >
              <Avatar
                firstName={user.firstName}
                lastName={user.lastName}
                src={user.avatarUrl ?? undefined}
                size="sm"
              />
              <div className="hidden lg:block text-left">
                <p className="text-[0.875rem] font-semibold text-slate-800 leading-tight tracking-[-0.02em]">
                  {user.firstName}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {ROLE_LABELS[user.role] ?? user.role}
                </p>
              </div>
              <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          }
          items={menuItems}
          align="right"
        />
      </div>
    </header>
  );
}
