import type { Booking } from "../../types";
import { Card } from "../ui/card";
import { format, parseISO } from "date-fns";
import { Star, RotateCcw, Download, ChevronRight } from "lucide-react";

interface BookingHistoryItemProps {
  booking: Booking;
  serviceName: string;
  providerName: string;
  onRebook: (bookingId: number) => void;
  onViewDetails: (bookingId: number) => void;
  onDownloadInvoice?: (bookingId: number) => void;
}

export function BookingHistoryItem({
  booking,
  serviceName,
  providerName,
  onRebook,
  onViewDetails,
  onDownloadInvoice,
}: BookingHistoryItemProps) {
  const displayDate = format(parseISO(booking.scheduled_date), "MMM d, yyyy");
  const displayTime = booking.scheduled_time;

  const getStatusColor = (status: string) => {
    if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700";
    if (status === "CANCELLED") return "bg-slate-100 text-slate-700";
    if (status === "DISPUTED") return "bg-red-50 text-red-700";
    if (status === "REFUNDED") return "bg-blue-50 text-blue-700";
    return "bg-slate-50 text-slate-700";
  };

  const hasReview = booking.has_review;
  const reviewRating = booking.review_rating;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(booking.id)}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Service & Provider Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{serviceName}</h3>
          <p className="text-xs text-slate-500 mt-1">👤 {providerName}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-slate-600">📅 {displayDate} • 🕐 {displayTime}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">📍 {booking.locality}</p>
        </div>

        {/* Right: Status & Amount */}
        <div className="flex-shrink-0 text-right">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
            {booking.status === "COMPLETED" ? "✓ Completed" : booking.status}
          </span>
          
          <p className="text-lg font-bold text-slate-900 mt-2">₹{booking.total_price}</p>

          {/* Review Status */}
          {booking.status === "COMPLETED" && (
            <div className="mt-2">
              {hasReview ? (
                <div className="flex items-center gap-1 justify-end">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < (reviewRating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-sky-600 font-medium">No review yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
        <div className="flex gap-2 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRebook(booking.id);
            }}
            className="flex-1 h-9 flex items-center justify-center gap-1 rounded-lg border border-sky-200 bg-sky-50 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Rebook
          </button>
          {onDownloadInvoice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadInvoice(booking.id);
              }}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Download Invoice"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </Card>
  );
}

interface BookingHistoryProps {
  bookings: Booking[];
  serviceMap: Map<number, string>;
  providerMap: Map<string, string>;
  onRebook: (bookingId: number) => void;
  onViewDetails: (bookingId: number) => void;
  onDownloadInvoice?: (bookingId: number) => void;
  isLoading?: boolean;
  maxItems?: number;
}

export function BookingHistory({
  bookings,
  serviceMap,
  providerMap,
  onRebook,
  onViewDetails,
  onDownloadInvoice,
  isLoading = false,
  maxItems = 5,
}: BookingHistoryProps) {
  const completedBookings = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED" || b.status === "REFUNDED")
    .slice(0, maxItems);

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (completedBookings.length === 0) {
    return (
      <Card className="py-8 text-center">
        <p className="text-slate-600">No booking history yet</p>
        <p className="text-xs text-slate-500 mt-1">Your completed services will appear here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {completedBookings.map((booking) => (
        <BookingHistoryItem
          key={booking.id}
          booking={booking}
          serviceName={serviceMap.get(booking.service) || "Service"}
          providerName={providerMap.get(booking.provider) || "Provider"}
          onRebook={onRebook}
          onViewDetails={onViewDetails}
          onDownloadInvoice={onDownloadInvoice}
        />
      ))}
    </div>
  );
}
