import { create } from "zustand";

import type { NotificationItem } from "../types";
import { notificationService } from "../services/notificationService";

type NotificationStore = {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  socket: WebSocket | null;
  toasts: NotificationItem[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectRealtime: () => void;
  disconnectRealtime: () => void;
  dismissToast: (id: number) => void;
};

const withDerived = (notifications: NotificationItem[]) => ({
  notifications,
  unreadCount: notifications.filter((item) => !item.is_read).length,
});

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null,
  toasts: [],

  async fetchNotifications() {
    set({ loading: true });
    try {
      const { data } = await notificationService.list();
      set({ ...withDerived(data), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async markAsRead(id) {
    const existing = get().notifications.find((item) => item.id === id);
    if (!existing || existing.is_read) return;

    await notificationService.markRead(id);
    const updated = get().notifications.map((item) =>
      item.id === id ? { ...item, is_read: true } : item,
    );
    set({ ...withDerived(updated) });
  },

  async markAllAsRead() {
    const unread = get().notifications.filter((item) => !item.is_read);
    for (const item of unread) {
      await notificationService.markRead(item.id);
    }
    const updated = get().notifications.map((item) => ({ ...item, is_read: true }));
    set({ ...withDerived(updated) });
  },

  connectRealtime() {
    const current = get().socket;
    if (current && current.readyState === WebSocket.OPEN) return;

    const socket = notificationService.connectSocket();
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as NotificationItem;
      set((state) => {
        const deduped = [payload, ...state.notifications.filter((item) => item.id !== payload.id)];
        const toasts = [payload, ...state.toasts].slice(0, 4);
        return {
          ...withDerived(deduped),
          toasts,
        };
      });
    };

    socket.onclose = () => {
      set({ socket: null });
    };

    set({ socket });
  },

  disconnectRealtime() {
    const socket = get().socket;
    if (socket) socket.close();
    set({ socket: null });
  },

  dismissToast(id) {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
  },
}));
