import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL, tokenStore } from "@/lib/api";
import type { WebSocketNotification } from "@/types/api";

interface UseNotificationsResult {
  isConnected: boolean;
  notifications: WebSocketNotification[];
  dismiss: (index: number) => void;
  clearAll: () => void;
}

const MAX_TOASTS = 5;
const RECONNECT_DELAY_MS = 4000;

/**
 * Maintains a persistent WebSocket connection to the backend's
 * /ws/notifications endpoint and surfaces analysis-complete events
 * as in-app toast notifications. Reconnects automatically on drop.
 */
export function useNotifications(enabled: boolean): UseNotificationsResult {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    const token = tokenStore.getAccess();
    if (!token || !enabled) return;

    const ws = new WebSocket(`${WS_URL}/ws/notifications?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (mountedRef.current) setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketNotification = JSON.parse(event.data);
        if (data.type === "ping" || data.type === "connected") return;
        if (!mountedRef.current) return;
        setNotifications((prev) => [data, ...prev].slice(0, MAX_TOASTS));
      } catch {
        // Ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [enabled, connect]);

  const dismiss = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => setNotifications([]);

  return { isConnected, notifications, dismiss, clearAll };
}
