import { earningsTableFallback } from "../mockData";
import { ProviderLayout } from "../components/ProviderLayout";
import { StatsCard } from "../components/StatsCard";
import { DollarSign, Wallet, Banknote } from "lucide-react";

export function ProviderEarnings() {
  const bars = [40, 55, 32, 64, 70, 62, 80];

  return (
    <ProviderLayout title="Earnings" subtitle="Track payouts, trends, and payment status">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Earnings" value="₹1,84,520" subtitle="Lifetime" icon={DollarSign} accent="emerald" />
        <StatsCard title="Monthly Earnings" value="₹28,440" subtitle="Current month" icon={Wallet} accent="sky" />
        <StatsCard title="Pending Payments" value="₹3,240" subtitle="Awaiting release" icon={Banknote} accent="amber" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Earnings chart</h3>
        <div className="mt-4 grid h-44 grid-cols-7 items-end gap-3">
          {bars.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-500" style={{ height: `${val * 1.5}px` }} />
              <span className="text-xs text-slate-500">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-base font-semibold text-slate-900">Payments table</h3>
        </div>
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
              {earningsTableFallback.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.service}</td>
                  <td className="px-5 py-3 text-slate-600">{row.customer}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{row.amount}</td>
                  <td className="px-5 py-3 text-slate-600">{row.date}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
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
