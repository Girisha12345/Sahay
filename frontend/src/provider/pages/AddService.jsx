import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderLayout } from "../components/ProviderLayout";
import { providerServiceApi } from "../../services/providerServiceApi";
import { serviceService } from "../../services/serviceService";

const days = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(Date.UTC(2024, 0, 1 + index))),
);

export function AddService() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    base_price: "",
    duration_minutes: "60",
    location: "",
  });
  const [availableDays, setAvailableDays] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    serviceService
      .getCategories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const toggleDay = (day) => {
    setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.category) {
      setError("Please select a category.");
      return;
    }
    setLoading(true);
    try {
      await providerServiceApi.createService({
        title: form.title,
        description: form.description,
        base_price: Number(form.base_price),
        category: Number(form.category),
        duration_minutes: Number(form.duration_minutes) || 60,
        location: form.location,
        is_active: true,
      });
      navigate("/provider/services");
    } catch {
      setError("Failed to save service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderLayout title="Add / Edit Service" subtitle="Create a high-converting service listing">
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Service title
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Category
            <select className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Description
            <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Price
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="₹999" required value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Service duration
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="60 mins" required value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Location served
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="Bengaluru" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700">Available days</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {days.map((day) => (
              <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-full px-4 py-2 text-xs font-semibold ${availableDays.includes(day) ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                {day}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">{loading ? "Saving..." : "Save Service"}</button>
      </form>
    </ProviderLayout>
  );
}
