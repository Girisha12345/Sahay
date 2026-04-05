import { useCallback, useEffect, useMemo, useState } from "react";

import { chatService } from "../services/chatService";
import type { ChatMessage, User } from "../types";

type UseChatSocketState = {
  messages: ChatMessage[];
  isConnecting: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  isProviderTyping: boolean;
  warning: string | null;
  sendMessage: (text: string) => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
};

export function useChatSocket(bookingId: number | null, currentUser: User | null): UseChatSocketState {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isProviderTyping, setIsProviderTyping] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    let retries = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;
    let activeSocket: WebSocket | null = null;

    const loadHistory = async () => {
      try {
        const { data } = await chatService.history(bookingId);
        const normalized = (data as Array<{ id: number; sender: string; content: string; created_at: string }>).map((item) => ({
          id: item.id,
          sender_id: String(item.sender),
          sender_role: String(item.sender) === currentUser?.id ? "CUSTOMER" : "PROVIDER",
          message_text: item.content,
          timestamp: item.created_at,
        } as ChatMessage));
        setMessages(normalized);
      } catch {
        setWarning("Unable to load previous messages.");
      }
    };

    const connect = () => {
      if (!isActive) return;
      setIsConnecting(true);
      const ws = chatService.connectSocket(bookingId);
      activeSocket = ws;
      setSocket(ws);

      ws.onopen = () => {
        retries = 0;
        setIsConnecting(false);
        setIsConnected(true);
        setIsReconnecting(false);
        setWarning(null);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (!isActive) return;
        retries += 1;
        const waitMs = Math.min(1000 * retries, 6000);
        setIsReconnecting(true);
        setWarning("Reconnecting...");
        reconnectTimer = setTimeout(connect, waitMs);
      };

      ws.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      chatService.onMessage(ws, currentUser, (message) => {
        if (message.is_typing) {
          setIsProviderTyping(message.sender_role === "PROVIDER");
          return;
        }
        setIsProviderTyping(false);
        setMessages((prev) => [...prev, message]);
        if (message.blocked) {
          setWarning(message.message_text);
        }
      });
    };

    void loadHistory();
    connect();

    return () => {
      isActive = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      activeSocket?.close();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      setIsReconnecting(false);
      setIsProviderTyping(false);
    };
  }, [bookingId, currentUser]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !bookingId) {
        return;
      }

      if (chatService.containsRestrictedContactData(trimmed)) {
        setWarning("Sharing contact details is not allowed before booking confirmation.");
        return;
      }

      setWarning(null);
      if (socket && socket.readyState === WebSocket.OPEN) {
        chatService.sendTyping(socket, false);
        chatService.sendMessage(socket, trimmed);
        return;
      }

      try {
        const { data } = await chatService.sendMessageHttp({ booking_id: bookingId, message: trimmed });
        const fallbackMessage: ChatMessage = {
          id: data.id,
          sender_id: String(data.sender),
          sender_role: String(data.sender) === currentUser?.id ? "CUSTOMER" : "PROVIDER",
          message_text: data.content,
          timestamp: data.created_at,
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } catch {
        setWarning("Unable to send message right now.");
      }
    },
    [bookingId, currentUser?.id, socket],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      chatService.sendTyping(socket, isTyping);
    },
    [socket],
  );

  return useMemo(
    () => ({
      messages,
      isConnecting,
      isConnected,
      isReconnecting,
      isProviderTyping,
      warning,
      sendMessage,
      sendTyping,
    }),
    [messages, isConnecting, isConnected, isReconnecting, isProviderTyping, warning, sendMessage, sendTyping],
  );
}
