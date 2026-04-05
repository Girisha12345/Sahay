import { useEffect } from "react";

import { useNotificationStore } from "../../store/notificationStore";

export function NotificationToasts() {
  const { toasts, dismissToast } = useNotificationStore();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3500),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, dismissToast]);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-600">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
