import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotificationStore } from "../store/notificationStore";

const fallbackNotifications = [
  { id: "fallback-1", title: "Booking confirmed" },
  { id: "fallback-2", title: "Payment successful" },
  { id: "fallback-3", title: "Provider accepted request" },
  { id: "fallback-4", title: "New message received" },
];

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { notifications, unreadCount } = useNotificationStore();

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const dropdownItems = useMemo(() => {
    if (!notifications.length) {
      return fallbackNotifications;
    }
    return notifications.map((item) => ({
      id: item.id,
      title: item.title,
    }));
  }, [notifications]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[60px] z-50 w-[300px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Notifications</h3>

          <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
            {dropdownItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {item.title}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
