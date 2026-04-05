import { create } from "zustand";

import { chatService } from "../services/chatService";
import type { Message } from "../types";

type ChatState = {
  socket: WebSocket | null;
  messages: Message[];
  connect: (bookingId: number) => void;
  send: (message: string) => void;
  disconnect: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  messages: [],

  connect(bookingId) {
    get().disconnect();
    const socket = chatService.connectSocket(bookingId);
    chatService.onMessage(socket, null, (payload) => {
      if (payload.sender_role === "SYSTEM") {
        return;
      }
      const mapped: Message = {
        id: payload.id,
        sender: payload.sender_id,
        content: payload.message_text,
        created_at: payload.timestamp,
      };
      set((state) => ({ messages: [...state.messages, mapped] }));
    });
    set({ socket, messages: [] });
  },

  send(message) {
    const socket = get().socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    chatService.sendMessage(socket, message);
  },

  disconnect() {
    const socket = get().socket;
    if (socket) socket.close();
    set({ socket: null });
  },
}));
