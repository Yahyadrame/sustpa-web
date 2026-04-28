"use client";

import { useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useSocket } from "@/hooks/use-socket";
import { NotificationCenter } from "./notification-center";
import { useState } from "react";

export function NotificationBell() {
  useSocket(); // Active la connexion WebSocket

  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  // CORRECTION 1 : on manipule la classe CSS directement sur le DOM
  // au lieu de setState dans un effect (évite les renders en cascade)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current && buttonRef.current) {
      buttonRef.current.classList.add("animate-wiggle");
      const timer = setTimeout(() => {
        buttonRef.current?.classList.remove("animate-wiggle");
      }, 600);
      prevCount.current = unreadCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <div className="relative">
      {/* CORRECTION 2 : style inline supprimé */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications — ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
        className={cn(
          "relative h-9 w-9 rounded-xl flex items-center justify-center",
          "text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all",
          open && "bg-slate-100 text-slate-700",
        )}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1",
              "rounded-full bg-primary-600 text-white text-[10px] font-bold",
              "flex items-center justify-center leading-none",
              "ring-2 ring-white transition-all",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau déroulant */}
      {open && <NotificationCenter onClose={() => setOpen(false)} />}
    </div>
  );
}
