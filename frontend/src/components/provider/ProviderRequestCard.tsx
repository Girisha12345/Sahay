import { useState } from "react";
import type { Booking } from "../../types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { format, parseISO } from "date-fns";
import { MapPin, Clock, DollarSign, User, CheckCircle2, X } from "lucide-react";

interface ProviderRequestCardProps {
  booking: Booking;
  serviceName?: string;
  onAccept: (bookingId: number) => Promise<void>;
  onReject: (bookingId: number) => Promise<void>;
  isLoading?: boolean;
}

export function ProviderRequestCard({
  booking,
  serviceName = "Service",
  onAccept,
  onReject,
  isLoading = false,
}: ProviderRequestCardProps) {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept(booking.id);
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(booking.id);
    } finally {
      setRejecting(false);
    }
  };

  const scheduledDate = parseISO(booking.scheduled_date);
  const scheduledTime = booking.scheduled_time;
  const customerName = "Customer";

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{serviceName}</h3>
          <p className="text-sm text-slate-500">Booking #{booking.id}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
          <User className="h-5 w-5 text-sky-600" />
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{customerName}</p>
        </div>
        <p className="text-xs text-slate-500">📍 Customer location confirmed</p>
      </div>

      {/* Details Grid */}
      <div className="grid gap-3">
        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-600">Scheduled</p>
            <p className="text-sm font-medium text-slate-900">
              {format(scheduledDate, "d MMM, yyyy")} • {scheduledTime}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <div className="flex-1">
            <p className="text-xs text-slate-600">Location</p>
            <p className="text-sm font-medium text-slate-900">{booking.locality}, {booking.address}</p>
            <p className="text-xs text-slate-500">{booking.pincode}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          <div className="flex-1">
            <p className="text-xs text-slate-600">You'll earn</p>
            <p className="text-sm font-bold text-emerald-700">₹{booking.final_provider_amount}</p>
            <p className="text-xs text-slate-500">Commission: ₹{booking.commission_amount}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="border-t border-slate-200 pt-3">
          <p className="text-xs font-medium text-slate-600 mb-1">Customer Notes</p>
          <p className="text-sm text-slate-700">{booking.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-slate-200 pt-3 flex gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={handleReject}
          disabled={rejecting || accepting || isLoading}
          className="flex-1"
        >
          <X className="mr-1 h-4 w-4" />
          {rejecting ? "Rejecting..." : "Reject"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAccept}
          disabled={accepting || rejecting || isLoading}
          className="flex-1"
        >
          <CheckCircle2 className="mr-1 h-4 w-4" />
          {accepting ? "Accepting..." : "Accept"}
        </Button>
      </div>
    </Card>
  );
}
