import { useEffect } from "react";

import { BookingCard } from "../../components/cards/booking-card";
import { Button } from "../../components/ui/button";
import { useBookingStore } from "../../store/bookingStore";

export function ProviderBookingsPage() {
  const { bookings, fetchProviderBookings } = useBookingStore();

  useEffect(() => {
    void fetchProviderBookings();
  }, [fetchProviderBookings]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Provider Bookings</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <div key={booking.id} className="space-y-2">
            <BookingCard booking={booking} />
            <div className="flex gap-2">
              <Button size="sm">Accept</Button>
              <Button size="sm" variant="danger">Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
