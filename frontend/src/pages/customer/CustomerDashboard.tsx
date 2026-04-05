import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, Calendar, Heart, TrendingUp, MapPin, Star, Download, ArrowRight } from "lucide-react";
import type { Booking, ServiceItem } from "../../types";

import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { paymentService } from "../../services/paymentService";
import { useAuthStore } from "../../store/authStore";
import { useBookingStore } from "../../store/bookingStore";
import { useServiceStore } from "../../store/serviceStore";
import { useNotificationStore } from "../../store/notificationStore";
import { currency } from "../../utils/format";
import { format, parseISO, formatDistanceToNow } from "date-fns";

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bookings, fetchCustomerBookings } = useBookingStore();
  const { services } = useServiceStore();
  const { notifications } = useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState("0");
  const [paymentsCount, setPaymentsCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchCustomerBookings();
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [fetchCustomerBookings]);

  // Load payment stats
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const { data } = await paymentService.history();
        const paidPayments = (data as Array<{ amount?: string; payment_status?: string }>).filter(
          (p) => p.payment_status === "PAID" || p.payment_status === "RELEASED",
        );
        const total = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setTotalSpent(total.toFixed(2));
        setPaymentsCount(paidPayments.length);
      } catch {
        const completed = bookings.filter(
          (b) => b.status === "COMPLETED" && (b.payment_status === "PAID" || b.payment_status === "RELEASED"),
        );
        const total = completed.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
        setTotalSpent(total.toFixed(2));
        setPaymentsCount(completed.length);
      }
    };
    void loadPayments();
  }, [bookings]);

  // Compute booking stats
  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => ["PENDING", "CONFIRMED", "ACCEPTED", "IN_PROGRESS"].includes(b.status))
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()),
    [bookings],
  );

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const savedProviders = useMemo(() => {
    const providers = new Map<string, { name: string; count: number }>();
    bookings.forEach((b) => {
      const key = b.provider;
      if (!providers.has(key)) {
        providers.set(key, { name: b.provider_name || "Provider", count: 0 });
      }
      providers.get(key)!.count++;
    });
    return Array.from(providers.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [bookings]);

  // Service lookup map
  const serviceMap = useMemo(() => {
    const map = new Map<number, ServiceItem>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  const displayName = user?.first_name || "Customer";
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 text-sky-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Shopping Focus */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-lg">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">Service Bookings</p>
            <h1 className="text-3xl font-bold mt-2">Hi {displayName}! 👋</h1>
            <p className="mt-3 max-w-2xl text-emerald-50 leading-relaxed">
              Manage your service bookings, discover new providers, and track your service spending all in one place.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => navigate("/categories")}
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold"
              >
                Browse Services
              </Button>
              <Button
                onClick={() => navigate("/notifications")}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold"
              >
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Button>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="flex-shrink-0 space-y-3">
            <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
              <p className="text-xs text-emerald-100">Upcoming</p>
              <p className="text-3xl font-bold text-white">{upcomingBookings.length}</p>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
              <p className="text-xs text-emerald-100">Completed</p>
              <p className="text-3xl font-bold text-white">{completedBookings.length}</p>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4">
              <p className="text-xs text-emerald-100">Total Spent</p>
              <p className="text-2xl font-bold text-white">₹{totalSpent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Upcoming Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Upcoming Services ({upcomingBookings.length})
              </h2>
              {upcomingBookings.length > 0 && (
                <a href="/customer/bookings" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 3).map((booking) => {
                  const service = serviceMap.get(booking.service);
                  const scheduledDate = parseISO(booking.scheduled_date);
                  const daysAway = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                  return (
                    <Card key={booking.id} className="p-4 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{service?.title || "Service"}</h3>
                            {daysAway <= 2 && (
                              <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                Starting soon
                              </span>
                            )}
                          </div>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="text-slate-600">
                              📅 {format(scheduledDate, "MMM d, yyyy")} at {booking.scheduled_time}
                            </p>
                            <p className="text-slate-600">📍 {booking.locality}</p>
                            <p className="text-slate-500">Provider: <span className="font-medium text-slate-900">{booking.provider_name || "Assigned soon"}</span></p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-500">Payment</p>
                          <p className="text-lg font-bold text-emerald-600">₹{booking.total_price}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                              booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" :
                              booking.status === "ACCEPTED" ? "bg-blue-100 text-blue-800" :
                              booking.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                              "bg-slate-100 text-slate-800"
                            }`}>
                              {booking.status === "CONFIRMED" ? "✓ Confirmed" :
                               booking.status === "ACCEPTED" ? "Ready" :
                               booking.status === "IN_PROGRESS" ? "In Progress" : booking.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 pt-3 border-t border-slate-200">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/customer/chat/${booking.id}`)} className="flex-1">
                          Message
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/booking/${booking.id}`)} className="flex-1">
                          Reschedule
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="py-8 text-center bg-slate-50">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-900 font-medium">No upcoming bookings</p>
                <p className="text-sm text-slate-500 mt-1">Browse services and book your first appointment today</p>
                <Button onClick={() => navigate("/categories")} className="mt-4">
                  Explore Services
                </Button>
              </Card>
            )}
          </div>

          {/* Completed Services */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Completed Services ({completedBookings.length})
            </h2>

            {completedBookings.length > 0 ? (
              <div className="grid gap-3">
                {completedBookings.slice(0, 3).map((booking) => {
                  const service = serviceMap.get(booking.service);
                  return (
                    <Card key={booking.id} className="p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{service?.title || "Service"}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {format(parseISO(booking.scheduled_date), "MMM d, yyyy")} • {booking.provider_name || "Provider"}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">₹{booking.total_price}</p>
                            {booking.has_review && (
                              <div className="flex gap-0.5 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < (booking.review_rating || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/services/${booking.service}`)}
                            className="text-xs"
                          >
                            Rebook
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="py-6 text-center bg-slate-50 text-sm text-slate-600">
                No completed services yet. Your finished bookings will appear here.
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Saved Providers & More */}
        <div className="space-y-6">
          {/* Saved Providers */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Favorite Providers
            </h3>

            {savedProviders.length > 0 ? (
              <div className="space-y-3">
                {savedProviders.map((provider, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{provider.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{provider.count} services booked</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-slate-900">4.8</span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate("/categories")}
                        className="text-xs"
                      >
                        Book
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-4 text-center bg-slate-50 text-sm text-slate-600">
                Book a service to save providers
              </Card>
            )}
          </div>

          {/* Spending Summary */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Spending Summary
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">₹{totalSpent}</p>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs text-slate-600">Completed Payments</p>
                <p className="text-lg font-bold text-slate-900">{paymentsCount} payments</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/payments")}
              className="w-full mt-4"
            >
              <Download className="h-4 w-4 mr-1" />
              View Invoices
            </Button>
          </Card>

          {/* Quick Links */}
          <div className="space-y-2">
            <Button
              variant="secondary"
              onClick={() => navigate("/customer/addresses")}
              className="w-full justify-start"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Saved Addresses
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/customer/profile")}
              className="w-full justify-start"
            >
              <span>👤</span>
              <span className="ml-2">Edit Profile</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/customer/support")}
              className="w-full justify-start"
            >
              <span>💬</span>
              <span className="ml-2">Support</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
