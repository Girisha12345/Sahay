import { Bell, CalendarClock, CreditCard, MessageCircle } from "lucide-react";
import { useEffect } from "react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { useNotificationStore } from "../../store/notificationStore";
import type { NotificationItem } from "../../types";

const iconMap: Record<string, typeof Bell> = {
  BOOKING_CREATED: CalendarClock,
  BOOKING_ACCEPTED: MessageCircle,
  PAYMENT_SUCCESS: CreditCard,
  NEW_MESSAGE: MessageCircle,
  BOOKING_COMPLETED: CalendarClock,
  BOOKING_CANCELLED: Bell,
  REFUND_INITIATED: CreditCard,
};

export function CustomerNotifications() {
  const { notifications, loading, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const onClick = async (item: NotificationItem) => {
    await markAsRead(item.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-2 text-sm text-slate-500">Booking updates, payment updates, and chat messages in one place.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((item) => {
            const Icon = iconMap[item.notification_type] || Bell;

            return (
              <Card
                key={item.id}
                className={`cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg ${item.is_read ? "opacity-80" : ""}`}
                onClick={() => void onClick(item)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">No notifications yet.</p>
        </Card>
      )}
    </div>
  );
}