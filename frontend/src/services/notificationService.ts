import { WS_BASE_URL } from "../utils/constants";
import { api } from "./api";

export const notificationService = {
  list: () => api.get("notifications/"),
  create: (payload: { title: string; message: string; notification_type: string; payload?: Record<string, unknown> }) =>
    api.post("notifications/", payload),
  markRead: (id: number) => api.patch(`notifications/${id}/read/`),
  connectSocket: () => {
    const token = localStorage.getItem("accessToken");
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    return new WebSocket(`${WS_BASE_URL}/ws/notifications/${tokenQuery}`);
  },
};
