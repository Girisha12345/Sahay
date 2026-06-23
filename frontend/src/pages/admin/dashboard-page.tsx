import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderTree, Users, ShieldAlert, CreditCard } from "lucide-react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { adminService, type AdminRevenueAnalytics } from "../../services/adminService";

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminRevenueAnalytics | null>(null);
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
          <p className="mt-2 text-2xl font-bold">₹{analytics?.total_revenue?.toLocaleString("en-IN") ?? "..."}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Bookings</p>
          <p className="mt-2 text-2xl font-bold">{analytics?.total_bookings ?? "..."}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Completed Bookings</p>
          <p className="mt-2 text-2xl font-bold">{analytics?.completed_bookings ?? "..."}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Cancelled Bookings</p>
          <p className="mt-2 text-2xl font-bold">{analytics?.cancelled_bookings ?? "..."}</p>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthly_revenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => {
                    const numericValue = Number(value || 0);
                    return [`₹${numericValue.toLocaleString("en-IN")}`, "Revenue"];
                  }}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h3 className="font-bold text-lg text-slate-900">Moderation Actions</h3>
        <p className="mt-1 text-sm text-slate-500">Quick links to perform marketplace operations and verification tasks.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/categories"
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-sky-500 hover:bg-sky-50/20"
          >
            <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Categories</p>
              <p className="text-xs text-slate-500 mt-0.5">Manage service taxonomy</p>
            </div>
          </Link>

          <Link
            to="/admin/providers"
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-sky-500 hover:bg-sky-50/20"
          >
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Providers</p>
              <p className="text-xs text-slate-500 mt-0.5">Verify and onboard partners</p>
            </div>
          </Link>

          <Link
            to="/admin/flagged-chats"
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-sky-500 hover:bg-sky-50/20"
          >
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Flagged Chats</p>
              <p className="text-xs text-slate-500 mt-0.5">Moderate flagged messages</p>
            </div>
          </Link>

          <Link
            to="/admin/payments"
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-sky-500 hover:bg-sky-50/20"
          >
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Verify Payments</p>
              <p className="text-xs text-slate-500 mt-0.5">Review manual UPI receipts</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
