import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import { useServiceStore } from "../../store/serviceStore";
import { useAuthStore } from "../../store/authStore";
import { ProviderDashboardStats } from "../../components/provider/ProviderDashboardStats";
import { ProviderRequestCard } from "../../components/provider/ProviderRequestCard";
import { ActiveJobCard } from "../../components/provider/ActiveJobCard";
import { EarningsSummary } from "../../components/provider/EarningsSummary";
import { RatingsReviews } from "../../components/provider/RatingsReviews";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import type { ServiceReview } from "../../types";
import { bookingService } from "../../services/bookingService";
import { reviewService } from "../../services/reviewService";
import { Loader, AlertCircle, TrendingUp, Calendar, Award } from "lucide-react";

type TabType = "overview" | "requests" | "active" | "earnings" | "reviews";

export function ProviderDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bookings, fetchProviderBookings } = useBookingStore();
  const { services } = useServiceStore();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [processing, setProcessing] = useState<number | null>(null);
  const [stats, setStats] = useState({
    inbox: 0,
    active: 0,
    completed: 0,
    earnings: "0",
    rating: 0,
  });
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const incomingBookings = bookings.filter((b) => b.status === "PENDING");
  const activeBookings = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "IN_PROGRESS");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchProviderBookings();
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [fetchProviderBookings]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (services.length === 0) return;
      setLoadingReviews(true);
      try {
        const allReviews: ServiceReview[] = [];
        for (const service of services) {
          const { data } = await reviewService.list(service.id);
          if (Array.isArray(data)) {
            allReviews.push(...data);
          }
        }
        setReviews(allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };
    void loadReviews();
  }, [services]);

  // Calculate stats
  useEffect(() => {
    // Calculate total provider amount from completed bookings
    const totalEarnings = completedBookings
      .reduce((sum, b) => sum + parseFloat(b.final_provider_amount || "0"), 0)
      .toFixed(2);

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    setStats({
      inbox: incomingBookings.length,
      active: activeBookings.length,
      completed: completedBookings.length,
      earnings: totalEarnings,
      rating: parseFloat(avgRating as string),
    });
  }, [bookings, reviews]);

  const handleAcceptBooking = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.acceptBooking(bookingId);
      void fetchProviderBookings();
    } catch (error) {
      console.error("Failed to accept booking:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.rejectBooking(bookingId);
      void fetchProviderBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleStartWork = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.startWork(bookingId);
      void fetchProviderBookings();
    } catch (error) {
      console.error("Failed to start work:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleCompleteBooking = async (bookingId: number) => {
    setProcessing(bookingId);
    try {
      await bookingService.completeBooking(bookingId);
      void fetchProviderBookings();
    } catch (error) {
      console.error("Failed to complete booking:", error);
    } finally {
      setProcessing(null);
    }
  };

  const getServiceName = (serviceId: number): string => {
    return services.find((s) => s.id === serviceId)?.title || "Service";
  };

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome back, {user?.first_name}! 👋</h1>
          <p className="mt-1 text-slate-600">Here's your work overview</p>
        </div>
        <Button onClick={() => navigate("/provider/profile")} variant="secondary">
          Edit Profile
        </Button>
      </div>

      {/* Dashboard Stats */}
      <ProviderDashboardStats stats={stats} />

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "overview", label: "📊 Overview", icon: "📊" },
          { id: "requests", label: `📬 Requests (${incomingBookings.length})`, icon: "📬" },
          { id: "active", label: `⚡ Active Jobs (${activeBookings.length})`, icon: "⚡" },
          { id: "earnings", label: "💰 Earnings", icon: "💰" },
          { id: "reviews", label: "⭐ Reviews", icon: "⭐" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-sky-600 text-sky-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {incomingBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    You have {incomingBookings.length} pending request{incomingBookings.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {incomingBookings.slice(0, 2).map((booking) => (
                    <ProviderRequestCard
                      key={booking.id}
                      booking={booking}
                      serviceName={getServiceName(booking.service)}
                      onAccept={handleAcceptBooking}
                      onReject={handleRejectBooking}
                      isLoading={processing === booking.id}
                    />
                  ))}
                </div>
                {incomingBookings.length > 2 && (
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab("requests")}
                    className="mt-3 w-full"
                  >
                    View all {incomingBookings.length} requests
                  </Button>
                )}
              </div>
            )}

            {activeBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-slate-900">
                    You're working on {activeBookings.length} job{activeBookings.length !== 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeBookings.slice(0, 2).map((booking) => (
                    <ActiveJobCard
                      key={booking.id}
                      booking={booking}
                      serviceName={getServiceName(booking.service)}
                      onStartWork={handleStartWork}
                      onCompleteWork={handleCompleteBooking}
                    />
                  ))}
                </div>
                {activeBookings.length > 2 && (
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab("active")}
                    className="mt-3 w-full"
                  >
                    View all {activeBookings.length} active jobs
                  </Button>
                )}
              </div>
            )}

            {incomingBookings.length === 0 && activeBookings.length === 0 && (
              <Card className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">No pending work</p>
                <p className="text-slate-600 mt-1">You'll see booking requests here when customers book your service</p>
                <Button
                  onClick={() => navigate("/provider/profile")}
                  className="mt-4"
                >
                  Complete your profile to get more bookings
                </Button>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3 mt-8">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600">Total Completed</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{completedBookings.length}</p>
                  </div>
                  <Award className="h-8 w-8 text-emerald-500" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600">Response Rate</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">100%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-sky-500" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600">Member Since</p>
                    <p className="text-sm font-bold text-slate-900 mt-2">{new Date(user?.created_at || "").toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {incomingBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {incomingBookings.map((booking) => (
                  <ProviderRequestCard
                    key={booking.id}
                    booking={booking}
                    serviceName={getServiceName(booking.service)}
                    onAccept={handleAcceptBooking}
                    onReject={handleRejectBooking}
                    isLoading={processing === booking.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">No pending requests</p>
                <p className="text-slate-600 mt-1">You're all caught up! New requests will appear here</p>
              </Card>
            )}
          </div>
        )}

        {/* Active Jobs Tab */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeBookings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activeBookings.map((booking) => (
                  <ActiveJobCard
                    key={booking.id}
                    booking={booking}
                    serviceName={getServiceName(booking.service)}
                    onStartWork={handleStartWork}
                    onCompleteWork={handleCompleteBooking}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">No active jobs</p>
                <p className="text-slate-600 mt-1">You don't have any jobs in progress. Accept requests from the inbox to start working</p>
                {incomingBookings.length > 0 && (
                  <Button
                    onClick={() => setActiveTab("requests")}
                    className="mt-4"
                  >
                    View {incomingBookings.length} pending request{incomingBookings.length !== 1 ? "s" : ""}
                  </Button>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <EarningsSummary
            totalEarnings={stats.earnings}
            availableBalance={stats.earnings}
            thisMonthEarnings={stats.earnings}
            completedJobs={completedBookings.length}
            averagePerJob={
              completedBookings.length > 0
                ? (parseFloat(stats.earnings) / completedBookings.length).toFixed(2)
                : "0"
            }
          />
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          !loadingReviews ? (
            <RatingsReviews
              averageRating={stats.rating}
              totalReviews={reviews.length}
              reviews={reviews}
            />
          ) : (
            <Card className="text-center py-12">
              <Loader className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-600">Loading reviews...</p>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
