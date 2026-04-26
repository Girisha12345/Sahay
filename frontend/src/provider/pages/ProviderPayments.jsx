import { CreditCard, CircleCheckBig, Clock3 } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";

const payouts = [
  { id: "PAYOUT-1042", amount: "₹3,240", date: "05 Apr 2026", status: "Pending" },
  { id: "PAYOUT-1041", amount: "₹5,980", date: "01 Apr 2026", status: "Completed" },
  { id: "PAYOUT-1040", amount: "₹4,520", date: "28 Mar 2026", status: "Completed" },
];

export function ProviderPayments() {
  return (
    <ProviderLayout title="Payments" subtitle="Track payouts, status, and settlement history">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Settlement</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">₹3,240</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <Clock3 className="h-3.5 w-3.5" />
            Processing
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Payout</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">₹5,980</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CircleCheckBig className="h-3.5 w-3.5" />
            Completed
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
              {payouts.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{row.amount}</td>
                  <td className="px-5 py-3 text-slate-600">{row.date}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProviderLayout>
  );
}
