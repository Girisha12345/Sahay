import { useEffect } from "react";

import { BookingCard } from "../../components/cards/booking-card";
import { EmptyState } from "../../components/ui/empty-state";
import { Spinner } from "../../components/ui/spinner";
import { useBookingStore } from "../../store/bookingStore";

export function CustomerBookingsPage() {
  const { bookings, loading, fetchCustomerBookings } = useBookingStore();

  useEffect(() => {
    void fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  if (loading) return <Spinner />;
  if (!bookings.length) return <EmptyState title="No bookings yet" subtitle="Book your first service to get started." />;

  return (
    <div>
      <h1 className="text-2xl font-bold">My Bookings</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
