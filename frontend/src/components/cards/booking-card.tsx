import { Card } from "../ui/card";
import type { Booking } from "../../types";

const statusStyle: Record<string, string> = {
  PENDING_PAYMENT: "bg-orange-50 text-orange-700",
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  ACCEPTED: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  REFUNDED: "bg-violet-50 text-violet-700",
  DISPUTED: "bg-red-50 text-red-700",
};

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">Booking #{booking.id}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[booking.status] || "bg-slate-100"}`}>
          {booking.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {booking.scheduled_date} at {booking.scheduled_time}
      </p>
      <p className="mt-1 text-sm text-slate-500">Provider: {booking.provider_name || booking.provider}</p>
      <p className="mt-1 text-sm text-slate-500">Payment: {booking.payment_status || "INITIATED"}</p>
      <p className="mt-1 text-sm text-slate-500">Total: {booking.total_price}</p>
    </Card>
  );
}
