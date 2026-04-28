"use client";

import {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ToastContainer } from "@/components/ui/toast";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  notifications?: number;
}

/* ── Hydration-safe client check ─────────────────────────── */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AppShell({ children, notifications = 0 }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isClient = useIsClient();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const prevPathname = useRef(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Ferme le drawer mobile à chaque changement de route */
  if (isClient && pathname !== prevPathname.current) {
    prevPathname.current = pathname;
    if (mobileOpen) setMobileOpen(false);
  }

  /* Redirect si pas d'utilisateur */
  useEffect(() => {
    if (!isClient) return;
    if (!user) router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, user]);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  /* ── Loader pleine page ─────────────────────────────────── */
  if (!isClient || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F6F8FA]">
        <div className="flex flex-col items-center gap-4">
          {/* Logo animé */}
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1B8A5A, #156e48)",
              boxShadow: "0 8px 24px -4px rgb(27 138 90/0.40)",
              animation: "float 2s ease-in-out infinite",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M16 6.5C16 4.567 14.433 3 12.5 3H8C5.791 3 4 4.791 4 7c0 1.8 1.2 3.3 2.9 3.8L13 12.5c1.5.4 2.5 1.8 2.5 3.5 0 2-1.7 3.5-3.8 3.5H8c-1.933 0-3.5-1.567-3.5-3.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Spinner discret */}
          <div
            className="h-5 w-5 rounded-full border-2 border-primary-600 border-t-transparent"
            style={{ animation: "spin 0.7s linear infinite" }}
          />
        </div>
      </div>
    );
  }

  const sidebarW = collapsed ? "w-[68px]" : "w-[248px]";

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* ═══════════════════════════════════════════════════════
          SIDEBAR DESKTOP — fixed, ancrée au viewport
      ════════════════════════════════════════════════════════ */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30",
          "hidden lg:flex lg:flex-col",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarW,
        )}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E8ECF0",
          boxShadow: "1px 0 0 0 #E8ECF0",
        }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggle}
          notifications={notifications}
        />
      </aside>

      {/* ═══════════════════════════════════════════════════════
          SIDEBAR MOBILE — drawer overlay
      ════════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: "rgba(13,17,23,0.35)",
              backdropFilter: "blur(4px)",
              animation: "fadeIn 0.15s ease-out",
            }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-62 lg:hidden"
            style={{
              background: "#FFFFFF",
              borderRight: "1px solid #E8ECF0",
              boxShadow: "4px 0 16px -4px rgb(0 0 0/0.12)",
              animation: "slideRight 0.25s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              notifications={notifications}
            />
          </aside>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          ZONE PRINCIPALE — margin-left compense la sidebar fixed
      ════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "flex flex-col min-h-screen",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:ml-17" : "lg:ml-62",
        )}
      >
        {/* Header sticky */}
        <div className="sticky top-0 z-20">
          <Header onMenuToggle={() => setMobileOpen((v) => !v)} />
        </div>

        {/* Contenu — scroll naturel */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}
