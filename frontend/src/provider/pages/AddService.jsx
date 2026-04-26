import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderLayout } from "../components/ProviderLayout";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AddService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    location: "",
    image: "",
    timeSlots: "",
  });
  const [availableDays, setAvailableDays] = useState([]);

  const toggleDay = (day) => {
    setAvailableDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form, availableDays };
    localStorage.setItem("provider_service_draft", JSON.stringify(payload));
    navigate("/provider/services");
  };

  return (
    <ProviderLayout title="Add / Edit Service" subtitle="Create a high-converting service listing">
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Service title
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Category
            <select className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              <option>Home Services</option>
              <option>Cleaning Services</option>
              <option>Beauty & Salon</option>
              <option>Automobile</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Description
            <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Price
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="₹999" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Service duration
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="60 mins" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Location served
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="Bengaluru" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">Upload image URL
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">Available time slots
            <input className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="09:00-12:00, 14:00-18:00" required value={form.timeSlots} onChange={(e) => setForm({ ...form, timeSlots: e.target.value })} />
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

        <button type="submit" className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">Save Service</button>
      </form>
    </ProviderLayout>
  );
}
