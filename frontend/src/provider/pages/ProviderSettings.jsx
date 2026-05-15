import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../api/authService";
import { ProviderLayout } from "../components/ProviderLayout";
import { useAuthStore } from "../../store/authStore";

export function ProviderSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    instantAlerts: true,
    emailSummary: true,
    autoAccept: false,
    darkMode: false,
  });
  const [deactivating, setDeactivating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      "Deactivate your provider account? You will be signed out and unable to access the dashboard until reactivated.",
    );

    if (!confirmed) return;

    setDeactivating(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      await authService.deactivateAccount(refreshToken);
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
      setStatusMessage("Your account has been deactivated. Redirecting to login...");
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to deactivate account.");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <ProviderLayout title="Settings" subtitle="Control your account and notification preferences">
      <div className="space-y-4">
        {statusMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</div>}
        {errorMessage && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>}
        <SettingRow title="Instant booking alerts" desc="Receive real-time push alerts for new booking requests" enabled={settings.instantAlerts} onToggle={() => toggle("instantAlerts")} />
        <SettingRow title="Daily email summary" desc="Get daily performance and earnings summary by email" enabled={settings.emailSummary} onToggle={() => toggle("emailSummary")} />
        <SettingRow title="Auto-accept trusted customers" desc="Automatically accept jobs from repeat customers" enabled={settings.autoAccept} onToggle={() => toggle("autoAccept")} />
        <SettingRow title="Dark mode" desc="Enable dark appearance for the provider dashboard" enabled={settings.darkMode} onToggle={() => toggle("darkMode")} />

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <h3 className="text-sm font-bold text-rose-800">Danger zone</h3>
          <p className="mt-1 text-xs text-rose-700">Deactivate account temporarily if you are not available for long duration.</p>
          <button
            type="button"
            onClick={() => void handleDeactivateAccount()}
            disabled={deactivating}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deactivating ? "Deactivating..." : "Deactivate Account"}
          </button>
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
