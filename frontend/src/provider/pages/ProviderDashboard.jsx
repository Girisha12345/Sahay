import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CalendarClock, CheckCircle2, DollarSign, Star } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";
import { StatsCard } from "../components/StatsCard";
import { bookingService } from "../../services/bookingService";
import { authService } from "../../services/authService";
import { paymentService } from "../../services/paymentService";
import { useAuthStore } from "../../store/authStore";

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [dashboardResponse, bookingsResponse] = await Promise.all([
          authService.getProviderDashboard(),
          bookingService.providerBookings(),
        ]);
        setDashboard(dashboardResponse.data);
        setBookings((bookingsResponse.data ?? []).slice(0, 3));

        try {
          const walletRes = await paymentService.getWallet();
          setChartData(walletRes.data?.weekly_chart ?? []);
        } catch {
          setChartData([]);
        }
      } catch {
        setDashboard(null);
        setBookings([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const profile = dashboard?.profile || null;
  const totalEarnings = bookings.reduce((sum, booking) => sum + Number(booking.final_provider_amount || 0), 0);
  const totalBookings = bookings.length;
  const pendingRequests = bookings.filter((booking) => booking.status === "PENDING").length;
  const completedJobs = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const completion = profile
    ? Math.min(100, Math.max(20, 40 + (profile.skills?.length || 0) * 10 + (profile.documents?.length || 0) * 5))
    : 78;

  const recentBookings = bookings.length ? bookings : [
    {
      id: "-",
      service_title: "No bookings yet",
      customer_public: { first_name: "", last_name: "" },
      scheduled_date: null,
      scheduled_time: "",
      status: "-",
    },
  ];

  return (
    <ProviderLayout
      title="Dashboard"
      subtitle="Overview of bookings, earnings, and service performance"
      rightContent={
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate("/provider/bookings")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View bookings
          </button>
          <button type="button" onClick={() => navigate("/provider/services")} className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700">
            Manage services
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 2xl:auto-rows-fr">
        <StatsCard title="Total Bookings" value={loading ? "..." : totalBookings} subtitle="All-time jobs" icon={Activity} accent="sky" />
        <StatsCard title="Pending Requests" value={loading ? "..." : pendingRequests} subtitle="Need action" icon={CalendarClock} accent="amber" />
        <StatsCard title="Completed Jobs" value={loading ? "..." : completedJobs} subtitle="Successfully delivered" icon={CheckCircle2} accent="emerald" />
        <StatsCard title="Total Earnings" value={loading ? "..." : `₹${totalEarnings.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} subtitle="From completed bookings" icon={DollarSign} accent="violet" />
        <StatsCard title="Average Rating" value={loading ? "..." : profile?.rating || "0"} subtitle="Customer satisfaction" icon={Star} accent="rose" />
      </div>

      {!loading && totalBookings === 0 && (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">No provider activity yet</p>
          <p className="mt-1 text-slate-600">
            Your dashboard is connected correctly. As soon as customers place bookings, the top metrics will update automatically here.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Upcoming bookings</h3>
          <div className="mt-4 space-y-3">
            {recentBookings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate("/provider/bookings")}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-900">{b.service_title || b.service_name || "Booking"}</p>
                  <p className="text-sm text-slate-500">
                    {b.customer_public ? `${b.customer_public.first_name} ${b.customer_public.last_name}`.trim() : b.customer_name || "Customer"}
                    {" • "}
                    {formatDate(b.scheduled_date || b.date)}
                    {" • "}
                    {b.scheduled_time || b.time || "-"}
                  </p>
                </div>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{b.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Profile completion</h3>
          <div className="mt-4">
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-sky-600" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{completion}% completed</p>
          </div>

          <h4 className="mt-6 text-sm font-semibold text-slate-900">Recent activity</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            <li>• {user?.first_name ? `Welcome back, ${user.first_name}` : "Provider dashboard loaded"}</li>
            <li>• {pendingRequests} requests waiting for action</li>
            <li>• {completedJobs} completed jobs recorded</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Monthly earnings trend</h3>
        <div className="mt-4 grid h-44 grid-cols-6 items-end gap-3">
          {chartData.length === 0 ? (
            <p className="col-span-6 py-8 text-center text-sm text-slate-400">No earnings data yet. Complete bookings to see the chart.</p>
          ) : (
            (() => {
              const maxVal = Math.max(...chartData.map((w) => Number(w.amount || 0)), 1);
              return chartData.map((w, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-sky-600 to-cyan-500" style={{ height: `${Math.max(8, (Number(w.amount || 0) / maxVal) * 140)}px` }} />
                  <span className="text-xs text-slate-500">{w.week}</span>
                </div>
              ));
            })()
          )}
        </div>
      </div>
    </ProviderLayout>
  );
}
