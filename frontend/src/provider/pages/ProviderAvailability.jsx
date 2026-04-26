import { useState } from "react";

import { ProviderLayout } from "../components/ProviderLayout";
import { availabilityFallback } from "../mockData";

export function ProviderAvailability() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [schedule, setSchedule] = useState(availabilityFallback);

  const update = (index, key, value) => {
    setSchedule((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  return (
    <ProviderLayout title="Availability" subtitle="Define your working hours and live availability">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div>
            <p className="font-semibold text-slate-900">Available for bookings</p>
            <p className="text-sm text-slate-500">Toggle your overall provider status</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable((v) => !v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${isAvailable ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"}`}
          >
            {isAvailable ? "Available" : "Not Available"}
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Day</th>
                <th className="px-2 py-2">Start</th>
                <th className="px-2 py-2">End</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={row.day} className="border-t border-slate-100">
                  <td className="px-2 py-2 font-medium text-slate-900">{row.day}</td>
                  <td className="px-2 py-2"><input type="time" value={row.from} onChange={(e) => update(i, "from", e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2" disabled={!row.enabled} /></td>
                  <td className="px-2 py-2"><input type="time" value={row.to} onChange={(e) => update(i, "to", e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2" disabled={!row.enabled} /></td>
                  <td className="px-2 py-2">
                    <button type="button" onClick={() => update(i, "enabled", !row.enabled)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${row.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {row.enabled ? "Working" : "Off"}
                    </button>
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
