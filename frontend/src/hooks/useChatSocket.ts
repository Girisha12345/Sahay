import { useCallback, useEffect, useRef, useState } from "react";

const WS_BASE = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";

interface ChatMessage {
  id: number;
  sender: string;
  sender_email?: string;
  content: string;
  created_at: string;
  is_flagged?: boolean;
  type?: string;
  message?: string;
}

export function useChatSocket(bookingId: number | string | null, tokenOrUser: string | { id?: string } | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blocked, setBlocked] = useState<string | null>(null);
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
      setMessages((prev) => [...prev, data]);
    };

    return () => ws.close();
  }, [bookingId, tokenOrUser]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: content }));
    }
  }, []);

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
    })),
    sendMessage: async (content: string) => sendMessage(content),
    connected,
    blocked,
    isConnecting: false,
    isConnected: connected,
    isReconnecting: false,
    isProviderTyping: false,
    warning: blocked,
    sendTyping: (_isTyping: boolean) => {},
  };
}
