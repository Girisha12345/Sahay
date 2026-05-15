import { useCallback, useEffect, useRef, useState } from "react";

const WS_BASE = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:8001";

interface ChatMessage {
  id: number;
  sender: string;
  sender_email?: string;
  content: string;
  created_at: string;
  is_flagged?: boolean;
  type?: string;
  message?: string;
  user_id?: string | number;
  online?: boolean;
  is_delivered?: boolean;
  is_read?: boolean;
}

export function useChatSocket(bookingId: number | string | null, tokenOrUser: string | { id?: string } | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = typeof tokenOrUser === "string" ? tokenOrUser : localStorage.getItem("accessToken");
    if (!token || !bookingId) return;

    const url = `${WS_BASE}/ws/chat/${bookingId}/?token=${token}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      const data: ChatMessage = JSON.parse(event.data);
      if (data.type === "error") {
        setBlocked(data.message ?? "Message blocked.");
        setTimeout(() => setBlocked(null), 5000);
        return;
      }

      if (data.type === "typing") {
        // provider typing indicator
        if (String(data.sender) !== String((tokenOrUser as any)?.id ?? localStorage.getItem("userId"))) {
          // set a short-lived typing state (not persisted here)
        }
        return;
      }

      if (data.type === "read") {
        // mark messages as read in local state
        setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
        return;
      }

      if (data.type === "booking_update") {
        // booking update arrived while in chat; ignore for messages
        return;
      }

      if (data.type === "presence") {
        // presence update for participant
        setPresence((p) => ({ ...p, [String(data.user_id)]: Boolean(data.online) }));
        return;
      }

      // normal message
      setMessages((prev) => [...prev, { ...data, is_delivered: data.is_delivered ?? false, is_read: data.is_read ?? false }]);
    };

    return () => ws.close();
  }, [bookingId, tokenOrUser]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: content }));
    }
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
    }
  }, []);

  const markRead = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "mark_read" }));
    } else if (bookingId) {
      fetch(`/api/chat/${bookingId}/mark-read/`, { method: "POST", headers: { "Content-Type": "application/json" } }).catch(() => {});
    }
  }, [bookingId]);

  // Backward-compatible fields for existing pages.
  return {
    messages: messages.map((item) => ({
      id: item.id,
      sender_id: item.sender,
      sender_role: "CUSTOMER" as "CUSTOMER" | "PROVIDER" | "SYSTEM",
      message_text: item.content,
      timestamp: item.created_at,
      blocked: Boolean(item.type === "error"),
      is_typing: false,
      is_delivered: (item as any).is_delivered ?? false,
      is_read: (item as any).is_read ?? false,
    })),
    sendMessage: async (content: string) => sendMessage(content),
    connected,
    blocked,
    isConnecting: false,
    isConnected: connected,
    isReconnecting: false,
    isProviderTyping: false,
    warning: blocked,
    sendTyping: (isTyping: boolean) => sendTyping(isTyping),
    markRead,
    presence,
  };
}
