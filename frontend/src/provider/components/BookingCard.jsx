import { CalendarDays, MapPin, Clock3, MessageCircle } from "lucide-react";

export function BookingCard({ booking, onAccept, onReject, onComplete, onReschedule, onChat }) {
  const statusColor = {
    PENDING: "bg-amber-50 text-amber-700",
    ACCEPTED: "bg-sky-50 text-sky-700",
    IN_PROGRESS: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
  };

  const customerName = booking.customer_public
    ? `${booking.customer_public.first_name || ""} ${booking.customer_public.last_name || ""}`.trim() || "Customer"
    : booking.customer_name || booking.full_name || "Customer";
  const serviceName = booking.service_title || booking.service_name || booking.service?.title || "Service";
  const displayDate = booking.scheduled_date || booking.date || "-";
  const displayTime = booking.scheduled_time || booking.time || "-";
  const displayAddress = booking.address || booking.locality || "-";
  const displayPrice = booking.total_price || booking.price || "₹0";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{serviceName}</h3>
          <p className="text-sm text-slate-500">Customer: {customerName}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[booking.status] || "bg-slate-100 text-slate-700"}`}>
          {booking.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {displayDate}</p>
        <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {displayTime}</p>
        <p className="flex items-center gap-2 sm:col-span-2"><MapPin className="h-4 w-4" /> {displayAddress}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-bold text-slate-900">{displayPrice}</p>
        <button
          type="button"
          onClick={() => onChat(booking)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <MessageCircle className="h-4 w-4" /> Chat
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button type="button" onClick={() => onAccept(booking)} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700">Accept</button>
        <button type="button" onClick={() => onReject(booking)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">Reject</button>
        <button type="button" onClick={() => onReschedule(booking)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Reschedule</button>
        <button type="button" onClick={() => onComplete(booking)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Complete</button>
      </div>
    </div>
  );
}
