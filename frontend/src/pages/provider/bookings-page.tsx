import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderRequestCard } from "../../components/provider/ProviderRequestCard";
import { ActiveJobCard } from "../../components/provider/ActiveJobCard";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useBookingStore } from "../../store/bookingStore";
import { useServiceStore } from "../../store/serviceStore";
import { bookingService } from "../../services/bookingService";
import { Loader, Search } from "lucide-react";

type BookingStatus = "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ALL";

export function ProviderBookingsPage() {
  const navigate = useNavigate();
  const { bookings, fetchProviderBookings } = useBookingStore();
  const { services } = useServiceStore();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        await fetchProviderBookings();
      } finally {
        setLoading(false);
      }
    };
    void loadBookings();
  }, [fetchProviderBookings]);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by search term (booking ID or service)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((b) => {
        const serviceName = services.find((s) => s.id === b.service)?.title || "";
        return (
          b.id.toString().includes(term) ||
          serviceName.toLowerCase().includes(term) ||
          b.locality.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [bookings, statusFilter, searchTerm, services]);

  const getServiceName = (serviceId: number): string => {
    return services.find((s) => s.id === serviceId)?.title || "Service";
  };

  const handleAccept = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.acceptBooking(bookingId);
      void fetchProviderBookings();
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.rejectBooking(bookingId);
      void fetchProviderBookings();
    } finally {
      setProcessing(null);
    }
  };

  const handleStartWork = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.startWork(bookingId);
      void fetchProviderBookings();
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.completeBooking(bookingId);
      void fetchProviderBookings();
    } finally {
      setProcessing(null);
    }
  };

  const getGroupedBookings = () => {
    const groups = {
      PENDING: filteredBookings.filter((b) => b.status === "PENDING"),
      ACCEPTED: filteredBookings.filter((b) => b.status === "ACCEPTED"),
      IN_PROGRESS: filteredBookings.filter((b) => b.status === "IN_PROGRESS"),
      COMPLETED: filteredBookings.filter((b) => b.status === "COMPLETED"),
      CANCELLED: filteredBookings.filter((b) => b.status === "CANCELLED"),
    };
    return groups;
  };

  const grouped = getGroupedBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Bookings</h1>
        <p className="mt-1 text-slate-600">Manage your service requests and jobs</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking ID, service, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
          className="h-10 px-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending Requests</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Grouped Bookings View */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-8">
          {/* Pending Requests */}
          {grouped.PENDING.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  📬 Pending Requests <span className="text-sm font-normal text-slate-600">({grouped.PENDING.length})</span>
                </h2>
                <p className="text-sm text-slate-600">Respond to these requests to accept or reject jobs</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {grouped.PENDING.map((booking) => (
                  <ProviderRequestCard
                    key={booking.id}
                    booking={booking}
                    serviceName={getServiceName(booking.service)}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isLoading={processing === booking.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Jobs */}
          {(grouped.ACCEPTED.length > 0 || grouped.IN_PROGRESS.length > 0) && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  ⚡ Active Jobs <span className="text-sm font-normal text-slate-600">({grouped.ACCEPTED.length + grouped.IN_PROGRESS.length})</span>
                </h2>
                <p className="text-sm text-slate-600">Complete these jobs to earn your commission</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[...grouped.ACCEPTED, ...grouped.IN_PROGRESS].map((booking) => (
                  <ActiveJobCard
                    key={booking.id}
                    booking={booking}
                    serviceName={getServiceName(booking.service)}
                    onStartWork={handleStartWork}
                    onCompleteWork={handleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Jobs */}
          {grouped.COMPLETED.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  ✅ Completed <span className="text-sm font-normal text-slate-600">({grouped.COMPLETED.length})</span>
                </h2>
                <p className="text-sm text-slate-600">Great work! These jobs have been completed</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {grouped.COMPLETED.map((booking) => (
                  <Card key={booking.id} className="p-4 bg-emerald-50 border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{getServiceName(booking.service)}</h3>
                        <p className="text-sm text-slate-600 mt-1">Booking #{booking.id}</p>
                        <p className="text-xs text-slate-500 mt-2">{booking.locality}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-700">Completed</p>
                        <p className="text-xs text-slate-600 mt-1">Earned: ₹{booking.final_provider_amount}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Jobs */}
          {grouped.CANCELLED.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  ❌ Cancelled <span className="text-sm font-normal text-slate-600">({grouped.CANCELLED.length})</span>
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {grouped.CANCELLED.map((booking) => (
                  <Card key={booking.id} className="p-4 bg-slate-50 border-slate-200 opacity-75">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{getServiceName(booking.service)}</h3>
                        <p className="text-sm text-slate-600 mt-1">Booking #{booking.id}</p>
                        <p className="text-xs text-slate-500 mt-2">{booking.locality}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">Cancelled</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-lg font-semibold text-slate-900">No bookings found</p>
          <p className="text-slate-600 mt-1">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search or filters"
              : "You don't have any bookings yet. Complete your profile to get more visibility"}
          </p>
          {!searchTerm && statusFilter === "ALL" && (
            <Button
              onClick={() => navigate("/provider/profile")}
              className="mt-4"
            >
              Complete Your Profile
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
