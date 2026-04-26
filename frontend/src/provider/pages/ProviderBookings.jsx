import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderLayout } from "../components/ProviderLayout";
import { BookingCard } from "../components/BookingCard";
import { bookingService } from "../../services/bookingService";
import { EmptyState } from "../../components/ui/empty-state";
import { Spinner } from "../../components/ui/spinner";

const tabs = ["ALL", "PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"];

export function ProviderBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ALL");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await bookingService.providerBookings();
        setBookings(data ?? []);
      } catch (fetchError) {
        setError((fetchError && fetchError.message) || "Unable to load bookings.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "ALL") return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [activeTab, bookings]);

  const updateStatus = async (booking, status) => {
    await bookingService.updateStatus({ booking_id: booking.id, status });
    const { data } = await bookingService.providerBookings();
    setBookings(data ?? []);
  };

  const handleReschedule = () => navigate("/provider/messages");

  const handleChat = () => navigate("/provider/messages");

  return (
    <ProviderLayout title="Bookings" subtitle="Manage all service requests and active jobs">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {tab === "ALL" ? "All bookings" : tab === "PENDING" ? "Pending requests" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="mt-6">
          <EmptyState title="Unable to load bookings" subtitle={error} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No bookings available"
            subtitle="When customers book your services, the requests will appear here automatically."
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={(b) => void updateStatus(b, "ACCEPTED")}
              onReject={(b) => void updateStatus(b, "CANCELLED")}
              onComplete={(b) => void updateStatus(b, "COMPLETED")}
              onReschedule={handleReschedule}
              onChat={handleChat}
            />
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}
