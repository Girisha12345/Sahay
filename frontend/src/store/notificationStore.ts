import { create } from "zustand";

import type { NotificationItem } from "../types";
import { notificationService } from "../services/notificationService";

type NotificationState = {
  notifications: NotificationItem[];
  loading: boolean;
  unreadCount: number;
  socket: WebSocket | null;
  toasts: NotificationItem[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectRealtime: () => void;
  disconnectRealtime: () => void;
  dismissToast: (id: number) => void;
};

const derive = (notifications: NotificationItem[]) => ({
  notifications,
  unreadCount: notifications.filter((item) => !item.is_read).length,
});

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,
  socket: null,
  toasts: [],

  async fetchNotifications() {
    set({ loading: true });
    try {
      const { data } = await notificationService.list();
      set({ ...derive(data ?? []), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  async markAsRead(id) {
    await notificationService.markRead(id);
    set((state) => ({
      ...derive(state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))),
    }));
  },

  async markRead(id) {
    return get().markAsRead(id);
  },

  async markAllAsRead() {
    const unread = get().notifications.filter((item) => !item.is_read);
    for (const item of unread) {
      await notificationService.markRead(item.id);
    }
    set((state) => ({
      ...derive(state.notifications.map((item) => ({ ...item, is_read: true }))),
    }));
  },

  connectRealtime() {
    void 0;
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
