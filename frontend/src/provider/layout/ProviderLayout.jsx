import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, UserCircle2, X } from "lucide-react";

import { NotificationToasts } from "../../components/notifications/NotificationToasts";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import { useUiStore } from "../../store/uiStore";
import { ProviderSidebar } from "./ProviderSidebar";

export function ProviderLayout({ title, subtitle, rightContent, children }) {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();
  const { fetchNotifications, connectRealtime, disconnectRealtime } = useNotificationStore();
  const { apiError, setApiError } = useUiStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      const customEvent = event;
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

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <NotificationToasts />

      {apiError && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:ml-[19rem] lg:mr-6">
          <div className="flex items-center justify-between gap-3">
            <span>{apiError}</span>
            <button className="font-semibold" onClick={() => setApiError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <ProviderSidebar onLogout={onLogout} />
        </div>

        {open && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}>
            <div className="h-full w-72" onClick={(e) => e.stopPropagation()}>
              <ProviderSidebar onLogout={onLogout} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 lg:ml-72">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                  aria-label="Open provider menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold leading-tight text-slate-900 sm:text-xl">{title}</h1>
                  {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
              </div>

              {rightContent || (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/provider/profile")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Provider profile"
                  >
                    <UserCircle2 className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                  >
                    Logout
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 lg:hidden"
                    aria-label="Close provider menu"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
