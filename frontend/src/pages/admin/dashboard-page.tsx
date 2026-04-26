import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { adminService, type AdminRevenueAnalytics } from "../../services/adminService";

type ChartRow = {
  label: string;
  value: number;
};

const EMPTY_ANALYTICS: AdminRevenueAnalytics = {
  totals: { revenue: 0, commission: 0, provider_earnings: 0 },
  payment_status: [],
  completed_bookings: 0,
  flagged_messages: 0,
};

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminRevenueAnalytics>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const { data } = await adminService.getRevenueAnalytics();
        if (isMounted) {
          setAnalytics(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage((error as Error).message || "Unable to load admin analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const trendData = useMemo<ChartRow[]>(
    () => [
      { label: "Revenue", value: Number(analytics.totals.revenue || 0) },
      { label: "Commission", value: Number(analytics.totals.commission || 0) },
      { label: "Provider", value: Number(analytics.totals.provider_earnings || 0) },
    ],
    [analytics],
  );

  const statusData = useMemo<ChartRow[]>(
    () =>
      analytics.payment_status.map((item) => ({
        label: item.payment_status,
        value: item.total,
      })),
    [analytics],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-500">Loading admin analytics...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {errorMessage && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{errorMessage}</p>}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-bold">₹{Number(analytics.totals.revenue || 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Commission</p>
          <p className="mt-2 text-2xl font-bold">₹{Number(analytics.totals.commission || 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Completed Bookings</p>
          <p className="mt-2 text-2xl font-bold">{analytics.completed_bookings}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Flagged Messages</p>
          <p className="mt-2 text-2xl font-bold">{analytics.flagged_messages}</p>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0369a1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Payment Status Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="font-semibold">Moderation</h3>
        <p className="mt-2 text-sm text-slate-500">Manage service categories, approve providers, and monitor flagged chats.</p>
      </Card>
    </div>
  );
}
