import { useEffect } from "react";
import type { PropsWithChildren } from "react";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { NotificationToasts } from "../notifications/NotificationToasts";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useUiStore } from "../../store/uiStore";

export function MainLayout({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuthStore();
  const { fetchNotifications, connectRealtime, disconnectRealtime } = useNotificationStore();
  const { apiError, setApiError } = useUiStore();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      const nextMessage = customEvent.detail?.message;
      setApiError(nextMessage && nextMessage.trim().length > 0 ? nextMessage : null);
    };
    window.addEventListener("api:error", handler);
    return () => window.removeEventListener("api:error", handler);
  }, [setApiError]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectRealtime();
      return;
    }

    void fetchNotifications();
    connectRealtime();

    return () => {
      disconnectRealtime();
    };
  }, [isAuthenticated, fetchNotifications, connectRealtime, disconnectRealtime]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <NotificationToasts />
      {apiError && (
        <div className="mx-auto mt-4 max-w-7xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between gap-3">
            <span>{apiError}</span>
            <button className="font-semibold" onClick={() => setApiError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
