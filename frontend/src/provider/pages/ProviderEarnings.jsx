import { useEffect, useState } from "react";
import { DollarSign, Wallet, Banknote } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";
import { StatsCard } from "../components/StatsCard";
import { Spinner } from "../../components/ui/spinner";
import { paymentService } from "../../services/paymentService";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function statusClass(status) {
  const s = String(status).toUpperCase();
  if (s === "PAID" || s === "RELEASED") return "bg-emerald-50 text-emerald-700";
  if (s === "REFUNDED") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

export function ProviderEarnings() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paymentService
      .getWallet()
      .then((res) => setWallet(res.data))
      .catch(() => setError("Could not load earnings. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <ProviderLayout title="Earnings" subtitle="Track payouts, trends, and payment status">
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      </ProviderLayout>
    );

  if (error)
    return (
      <ProviderLayout title="Earnings" subtitle="Track payouts, trends, and payment status">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      </ProviderLayout>
    );

  const chartData = wallet?.weekly_chart ?? [];
  const maxVal = Math.max(...chartData.map((w) => w.amount), 1);

  return (
    <ProviderLayout title="Earnings" subtitle="Track payouts, trends, and payment status">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Earnings" value={formatINR(wallet?.total_earned)} subtitle="Lifetime" icon={DollarSign} accent="emerald" />
        <StatsCard title="Monthly Earnings" value={formatINR(wallet?.monthly_earned)} subtitle="Current month" icon={Wallet} accent="sky" />
        <StatsCard title="Pending Payments" value={formatINR(wallet?.pending_payout)} subtitle="Awaiting release" icon={Banknote} accent="amber" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Earnings chart</h3>
        {chartData.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No weekly data yet. Complete bookings to see your chart.</p>
        ) : (
          <div className="mt-4 flex items-end gap-3" style={{ height: "176px" }}>
            {chartData.map((w, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-500"
                  style={{ height: `${Math.max(8, (w.amount / maxVal) * 160)}px` }}
                />
                <span className="text-xs text-slate-500">{w.week}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-base font-semibold text-slate-900">Payments table</h3>
        </div>
        {!wallet?.transactions?.length ? (
          <p className="px-5 py-6 text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900">{row.service}</td>
                    <td className="px-5 py-3 text-slate-600">{row.customer}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{formatINR(row.amount)}</td>
                    <td className="px-5 py-3 text-slate-600">{row.date}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                        {String(row.status).charAt(0) + String(row.status).slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
