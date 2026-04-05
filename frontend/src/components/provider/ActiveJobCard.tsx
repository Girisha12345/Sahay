import { useState } from "react";
import type { Booking } from "../../types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { format, parseISO } from "date-fns";
import { Phone, MapPin, Clock, CheckCircle2, User } from "lucide-react";

interface ActiveJobCardProps {
  booking: Booking;
  serviceName?: string;
  onStartWork?: (bookingId: number) => Promise<void>;
  onCompleteWork: (bookingId: number) => Promise<void>;
  onContact?: (bookingId: number) => void;
}

export function ActiveJobCard({
  booking,
  serviceName = "Service",
  onStartWork,
  onCompleteWork,
  onContact,
}: ActiveJobCardProps) {
  const [completing, setCompleting] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleStartWork = async () => {
    if (!onStartWork) return;
    setStarting(true);
    try {
      await onStartWork(booking.id);
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteWork = async () => {
    setCompleting(true);
    try {
      await onCompleteWork(booking.id);
    } finally {
      setCompleting(false);
    }
  };

  const scheduledDate = parseISO(booking.scheduled_date);
  const customerName = "Customer";

  const getStatusColor = (status: string) => {
    if (status === "IN_PROGRESS") return "bg-amber-50 border-amber-200";
    if (status === "ACCEPTED") return "bg-blue-50 border-blue-200";
    return "bg-slate-50 border-slate-200";
  };

  const getStatusLabel = (status: string) => {
    if (status === "IN_PROGRESS") return "In Progress";
    if (status === "ACCEPTED") return "Accepted";
    return status;
  };

  const getStatusIconColor = (status: string) => {
    if (status === "IN_PROGRESS") return "bg-amber-100";
    if (status === "ACCEPTED") return "bg-blue-100";
    return "bg-slate-100";
  };

  return (
    <Card className={`flex flex-col gap-4 border-2 ${getStatusColor(booking.status)}`}>
      {/* Header with Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{serviceName}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              booking.status === "IN_PROGRESS" 
                ? "bg-amber-100 text-amber-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              🔄 {getStatusLabel(booking.status)}
            </span>
            <p className="text-xs text-slate-500">Booking #{booking.id}</p>
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusIconColor(booking.status)}`}>
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* Customer & Schedule */}
      <div className="border-t border-slate-200 pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-900">{customerName}</p>
            <p className="text-xs text-slate-500">Scheduled for {format(scheduledDate, "d MMM, yyyy")} at {booking.scheduled_time}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 text-slate-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-slate-600">Work Location</p>
          <p className="text-sm font-medium text-slate-900">{booking.locality}</p>
          <p className="text-xs text-slate-500">{booking.address}</p>
        </div>
      </div>

      {/* Contact Info if revealed */}
      {(booking.status === "ACCEPTED" || booking.status === "IN_PROGRESS") && (
        <div className="border-t border-slate-200 pt-3">
          <p className="text-xs font-medium text-slate-600 mb-2">Customer Contact</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onContact?.(booking.id)}
            >
              <Phone className="mr-1 h-4 w-4" />
              Call
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onContact?.(booking.id)}
            >
              💬 Message
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-slate-200 pt-3 space-y-2">
        {booking.status === "ACCEPTED" && onStartWork && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStartWork}
            disabled={starting || completing}
            className="w-full"
          >
            ▶️ Start Work Now
          </Button>
        )}
        {(booking.status === "IN_PROGRESS" || booking.status === "ACCEPTED") && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCompleteWork}
            disabled={completing || starting}
            className="w-full"
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            {completing ? "Completing..." : "Mark as Completed"}
          </Button>
        )}
      </div>

      {/* Earnings Summary */}
      <div className="border-t border-slate-200 pt-3 bg-emerald-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
        <p className="text-xs text-emerald-700 font-medium">You will earn</p>
        <p className="text-lg font-bold text-emerald-800">₹{booking.final_provider_amount}</p>
      </div>
    </Card>
  );
}
