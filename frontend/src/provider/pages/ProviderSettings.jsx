import { useState } from "react";

import { ProviderLayout } from "../components/ProviderLayout";

export function ProviderSettings() {
  const [settings, setSettings] = useState({
    instantAlerts: true,
    emailSummary: true,
    autoAccept: false,
    darkMode: false,
  });

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <ProviderLayout title="Settings" subtitle="Control your account and notification preferences">
      <div className="space-y-4">
        <SettingRow title="Instant booking alerts" desc="Receive real-time push alerts for new booking requests" enabled={settings.instantAlerts} onToggle={() => toggle("instantAlerts")} />
        <SettingRow title="Daily email summary" desc="Get daily performance and earnings summary by email" enabled={settings.emailSummary} onToggle={() => toggle("emailSummary")} />
        <SettingRow title="Auto-accept trusted customers" desc="Automatically accept jobs from repeat customers" enabled={settings.autoAccept} onToggle={() => toggle("autoAccept")} />
        <SettingRow title="Dark mode" desc="Enable dark appearance for the provider dashboard" enabled={settings.darkMode} onToggle={() => toggle("darkMode")} />

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <h3 className="text-sm font-bold text-rose-800">Danger zone</h3>
          <p className="mt-1 text-xs text-rose-700">Deactivate account temporarily if you are not available for long duration.</p>
          <button type="button" className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700">Deactivate Account</button>
        </div>
      </div>
    </ProviderLayout>
  );
}

function SettingRow({ title, desc, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <button type="button" onClick={onToggle} className={`rounded-full px-4 py-2 text-xs font-semibold ${enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>
        {enabled ? "On" : "Off"}
      </button>
    </div>
  );
}
