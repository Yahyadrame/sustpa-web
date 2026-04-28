"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationsStore } from "@/store/notifications.store";
import type { Notification } from "@/types/notification.types";

let socketInstance: Socket | null = null;

export function useSocket(): void {
  const socketRef = useRef<Socket | null>(null);
  const addNotif = useNotificationsStore((s) => s.addNotification);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ CORRIGÉ — plus de localStorage.getItem("access_token")
    // withCredentials envoie automatiquement le cookie httpOnly access_token
    // Le gateway NestJS l'extrait via client.handshake.headers.cookie
    if (!socketInstance) {
      socketInstance = io(
        `${process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3002"}/notifications`,
        {
          withCredentials: true, // ✅ transmet les cookies httpOnly
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionAttempts: 5,
        },
      );
    }

    socketRef.current = socketInstance;

    const onNewNotification = (data: Notification) => {
      addNotif(data);
      if ("vibrate" in navigator) navigator.vibrate(100);
    };

    socketInstance.on("notification:new", onNewNotification);
    socketInstance.on("connect", () => console.log("[WS] Connecté"));
    socketInstance.on("disconnect", () => console.log("[WS] Déconnecté"));

    return () => {
      socketInstance?.off("notification:new", onNewNotification);
    };
  }, [addNotif]);
}
