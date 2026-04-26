import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { paymentService } from "../../services/paymentService";
import type { WalletData } from "../../types";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusColor(status: string): string {
  const s = status.toUpperCase();
  if (s === "PAID" || s === "RELEASED") return "text-green-600 font-medium";
  if (s === "REFUNDED") return "text-red-500 font-medium";
  return "text-amber-500 font-medium";
}

export function ProviderEarningsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    paymentService
      .getWallet()
      .then((res) => setWallet(res.data as WalletData))
      .catch(() => setError("Could not load earnings. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  if (!wallet || wallet.transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-sm text-slate-500">
            Track payouts, trends, and payment status
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total Earnings
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatINR(wallet?.total_earned ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Lifetime</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Monthly Earnings
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatINR(wallet?.monthly_earned ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Current month</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Pending Payments
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatINR(wallet?.pending_payout ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Awaiting release</p>
          </Card>
        </div>

        <Card>
          <p className="text-sm text-slate-500">
            No transactions yet. Complete your first booking to see earnings here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-sm text-slate-500">
          Track payouts, trends, and payment status
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Total Earnings
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatINR(wallet.total_earned)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Lifetime</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Monthly Earnings
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatINR(wallet.monthly_earned)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Current month</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Pending Payments
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatINR(wallet.pending_payout)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Awaiting release</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Earnings chart</h2>
        {wallet.weekly_chart.length === 0 ? (
          <p className="text-sm text-slate-400">
            Not enough data for chart yet.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={wallet.weekly_chart}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  }
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(value: unknown) => [
                    formatINR(Number(value ?? 0)),
                    "Earnings",
                  ]}
                  cursor={{ fill: "rgba(20,184,166,0.08)" }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#earningsGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="earningsGradient"
                    x1="0" y1="0"
                    x2="0" y2="1"
                  >
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Payments table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-4">Service</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {wallet.transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="py-3 pr-4 font-medium text-slate-800">
                    {tx.service}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {tx.customer}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-900">
                    {tx.tx_type === "DEBIT" ? "−" : ""}
                    {formatINR(tx.amount)}
                  </td>
                  <td className="py-3 pr-4 text-slate-500">
                    {tx.date}
                  </td>
                  <td className={`py-3 ${statusColor(tx.status)}`}>
                    {tx.status.charAt(0) +
                     tx.status.slice(1).toLowerCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Platform commission (10%) already deducted.
          Total deducted: {formatINR(wallet.total_commission_deducted)}
        </p>
      </Card>
    </div>
  );
}
