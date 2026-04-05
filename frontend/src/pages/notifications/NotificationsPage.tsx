import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { Spinner } from "../../components/ui/spinner";
import type { NotificationItem } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";

const typeIcon: Record<string, string> = {
  BOOKING_CREATED: "🛎️",
  BOOKING_ACCEPTED: "✅",
  PAYMENT_SUCCESS: "💳",
  NEW_MESSAGE: "💬",
  BOOKING_COMPLETED: "🎉",
  BOOKING_CANCELLED: "⚠️",
  REFUND_INITIATED: "↩️",
};

function routeForNotification(item: NotificationItem, role?: string): string {
  if (item.notification_type === "NEW_MESSAGE" && item.payload?.booking_id) {
    return role === "PROVIDER" ? "/provider/bookings" : `/customer/chat/${item.payload.booking_id}`;
  }
  if (item.notification_type.startsWith("BOOKING") || item.notification_type === "PAYMENT_SUCCESS") {
    if (role === "PROVIDER") return "/provider/bookings";
    if (role === "ADMIN") return "/admin/dashboard";
    return "/customer/bookings";
  }
  return "/notifications";
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, loading, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const onClickNotification = async (item: NotificationItem) => {
    await markAsRead(item.id);
    navigate(routeForNotification(item, user?.role));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
      <p className="mt-2 text-sm text-slate-500">Stay updated on bookings, payments, and chat activity.</p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : !notifications.length ? (
        <div className="mt-8">
          <EmptyState title="No notifications yet" subtitle="Booking and payment updates will appear here in real time." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer rounded-xl p-4 shadow-md transition hover:bg-gray-50 ${item.is_read ? "bg-white" : "bg-sky-50"}`}
              onClick={() => void onClickNotification(item)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{typeIcon[item.notification_type] || "🔔"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    {!item.is_read && <span className="text-xs font-semibold text-sky-700">Unread</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
