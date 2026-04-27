import { useEffect, useState } from "react";
import { CreditCard, CircleCheckBig, Clock3 } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";
import { Spinner } from "../../components/ui/spinner";
import { paymentService } from "../../services/paymentService";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function ProviderPayments() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    paymentService
      .getWallet()
      .then((res) => setWallet(res.data))
      .catch(() => setError("Could not load payment data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <ProviderLayout title="Payments" subtitle="Track payouts, status, and settlement history">
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      </ProviderLayout>
    );

  if (error)
    return (
      <ProviderLayout title="Payments" subtitle="Track payouts, status, and settlement history">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      </ProviderLayout>
    );

  const transactions = wallet?.transactions ?? [];
  const lastPaid = transactions.find((t) => t.tx_type === "CREDIT");

  return (
    <ProviderLayout title="Payments" subtitle="Track payouts, status, and settlement history">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Settlement</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatINR(wallet?.pending_payout)}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Clock3 className="h-3.5 w-3.5" />
            Processing
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Payout</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{lastPaid ? formatINR(lastPaid.amount) : "—"}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CircleCheckBig className="h-3.5 w-3.5" />
            {lastPaid ? "Completed" : "None yet"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payout Method</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">Bank Account</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
            <CreditCard className="h-3.5 w-3.5" />
            Verified
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-base font-semibold text-slate-900">Recent payouts</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Payout ID</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.description || `TX-${row.id}`}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{formatINR(row.amount)}</td>
                  <td className="px-5 py-3 text-slate-600">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.tx_type === "CREDIT" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.tx_type}
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
