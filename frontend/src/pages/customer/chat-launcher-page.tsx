import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ChevronRight } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { useBookingStore } from "../../store/bookingStore";

export function ChatLauncherPage() {
  const navigate = useNavigate();
  const { bookings, loading, fetchCustomerBookings } = useBookingStore();

  useEffect(() => {
    void fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  const chatBookings = useMemo(() => {
    return [...bookings].sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();
      return rightTime - leftTime;
    });
  }, [bookings]);

  const latestBooking = chatBookings[0];

  if (loading) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <Spinner />
        <p className="mt-3 text-sm text-slate-500">Loading your bookings...</p>
      </Card>
    );
  }

  if (chatBookings.length === 0) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Chat</h1>
        <p className="mt-3 text-sm text-slate-600">No bookings found yet. Chat becomes available after you place a booking.</p>
        <Button className="mt-5" onClick={() => navigate("/services")}>Browse services</Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Chat</h1>
        <p className="mt-1 text-sm text-slate-500">Select a booking to open the conversation with the provider.</p>
      </div>

      <div className="space-y-3 p-6">
        {chatBookings.map((booking) => (
          <button
            key={booking.id}
            type="button"
            onClick={() => navigate(`/customer/chat/${booking.id}`)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Booking #{booking.id}</p>
              <p className="mt-1 text-xs text-slate-500">
                Provider: {booking.provider_name || "Provider"} · Status: {booking.status}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}

        {latestBooking && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Latest booking ready for chat: #{latestBooking.id}
          </div>
        )}
      </div>
    </Card>
  );
}
