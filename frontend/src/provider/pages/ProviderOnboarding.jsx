import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderLayout } from "../components/ProviderLayout";

export function ProviderOnboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    skills: "",
    experience: "",
    city: "",
    languages: "",
    certificates: "",
  });

  const save = (e) => {
    e.preventDefault();
    const key = `provider_onboarding_done_${localStorage.getItem("accessToken") || "default"}`;
    localStorage.setItem(key, "true");
    localStorage.setItem("provider_profile_draft", JSON.stringify(form));
    navigate("/provider/dashboard", { replace: true });
  };

  return (
    <ProviderLayout title="Provider Onboarding" subtitle="Complete your worker profile to start receiving jobs">
      <form onSubmit={save} className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Set up your provider profile</h2>
        <p className="mt-1 text-sm text-slate-500">This helps customers discover and trust your services.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Skills
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="Plumbing, Electrical" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} required />
          </label>
          <label className="text-sm font-medium text-slate-700">Experience (years)
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="3" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required />
          </label>
          <label className="text-sm font-medium text-slate-700">Service City
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="Bengaluru" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </label>
          <label className="text-sm font-medium text-slate-700">Languages Known
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="English, Hindi, Kannada" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} required />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Certificates
            <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="License numbers, certificates..." value={form.certificates} onChange={(e) => setForm({ ...form, certificates: e.target.value })} />
          </label>
        </div>

        <button type="submit" className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">Finish Onboarding</button>
      </form>
    </ProviderLayout>
  );
}
