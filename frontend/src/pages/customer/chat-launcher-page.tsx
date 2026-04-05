import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { useBookingStore } from "../../store/bookingStore";

const activeStatuses = new Set(["PENDING", "PENDING_PAYMENT", "CONFIRMED", "ACCEPTED", "IN_PROGRESS"]);

export function ChatLauncherPage() {
  const navigate = useNavigate();
  const { bookings, loading, fetchCustomerBookings } = useBookingStore();

  useEffect(() => {
    void fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  const activeBooking = useMemo(
    () => bookings.find((booking) => activeStatuses.has(booking.status)),
    [bookings],
  );

  useEffect(() => {
    if (activeBooking) {
      navigate(`/customer/chat/${activeBooking.id}`, { replace: true });
    }
  }, [activeBooking, navigate]);

  if (loading) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Spinner />
        <p className="mt-3 text-sm text-slate-500">Finding your active booking...</p>
      </Card>
    );
  }

  if (!activeBooking) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
        <p className="mt-3 text-sm text-slate-600">No active booking found. Please book a service first.</p>
      </Card>
    );
  }

  return null;
}
