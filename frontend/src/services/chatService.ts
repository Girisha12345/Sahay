import { WS_BASE_URL } from "../utils/constants";
import type { ChatMessage, User } from "../types";
import { api } from "./api";

const PHONE_PATTERN = /\b\d{10}\b/;
const EMAIL_PATTERN = /\b[\w.-]+@[\w.-]+\.\w+\b/;
const SOCIAL_PATTERN = /\b(instagram|insta|ig|whatsapp|wa|telegram|t\.me|facebook|fb|snapchat)\b/i;

type RawSocketMessage = {
  type?: string;
  id?: number;
  sender?: string | number;
  content?: string;
  created_at?: string;
  blocked?: boolean;
  detail?: string;
  is_typing?: boolean;
};

const inferSenderRole = (rawSender: string | number | undefined, currentUserId?: string): ChatMessage["sender_role"] => {
  if (!rawSender || !currentUserId) {
    return "SYSTEM";
  }
  return String(rawSender) === String(currentUserId) ? "CUSTOMER" : "PROVIDER";
};

const normalizeIncomingMessage = (raw: RawSocketMessage, currentUser: User | null): ChatMessage | null => {
  if (raw.type === "typing") {
    return {
      id: Date.now(),
      sender_id: String(raw.sender ?? ""),
      sender_role: inferSenderRole(raw.sender, currentUser?.id),
      message_text: "",
      timestamp: new Date().toISOString(),
      is_typing: Boolean(raw.is_typing),
    };
  }

  if (raw.blocked) {
    return {
      id: Date.now(),
      sender_id: "system",
      sender_role: "SYSTEM",
      message_text: raw.detail || "Sharing contact details is not allowed before booking confirmation.",
      timestamp: new Date().toISOString(),
      blocked: true,
    };
  }

  if (!raw.content) {
    return null;
  }

  return {
    id: raw.id ?? Date.now(),
    sender_id: String(raw.sender ?? ""),
    sender_role: inferSenderRole(raw.sender, currentUser?.id),
    message_text: raw.content,
    timestamp: raw.created_at ?? new Date().toISOString(),
  };
};

const containsRestrictedContactData = (message: string) => {
  return PHONE_PATTERN.test(message) || EMAIL_PATTERN.test(message) || SOCIAL_PATTERN.test(message);
};

export const chatService = {
  connectSocket: (bookingId: number) => {
    const token = localStorage.getItem("accessToken");
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    return new WebSocket(`${WS_BASE_URL}/ws/chat/${bookingId}/${tokenQuery}`);
  },
  sendMessage: (socket: WebSocket, message: string) => {
    socket.send(JSON.stringify({ message }));
  },
  sendTyping: (socket: WebSocket, isTyping: boolean) => {
    socket.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
  },
  history: (bookingId: number) => api.get(`chat/${bookingId}/`),
  sendMessageHttp: (payload: { booking_id: number; message: string }) => api.post("chat/send/", payload),
  onMessage: (socket: WebSocket, currentUser: User | null, onMessage: (data: ChatMessage) => void) => {
    socket.onmessage = (event) => {
      const parsed = JSON.parse(event.data) as RawSocketMessage;
      const normalized = normalizeIncomingMessage(parsed, currentUser);
      if (normalized) {
        onMessage(normalized);
      }
    };
  },
  containsRestrictedContactData,
};
