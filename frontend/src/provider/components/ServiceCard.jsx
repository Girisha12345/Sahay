import { Star, Clock3, MapPin } from "lucide-react";

export function ServiceCard({ service, onEdit, onDelete, onToggle }) {
  const categoryName = typeof service.category === "object" ? service.category?.name : service.category;
  const enabled = typeof service.is_active === "boolean" ? service.is_active : Boolean(service.enabled);
  const price = service.base_price ?? service.price;
  const duration = service.duration_minutes ? `${service.duration_minutes} mins` : service.duration;
  const rating = service.rating ?? "0.0";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[16/8] bg-gradient-to-r from-sky-500 to-cyan-500" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{service.title}</h3>
            <p className="text-xs text-slate-500">{categoryName || "Uncategorized"}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{price}</p>
          <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {duration}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {service.location}</p>
          <p className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> {rating}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => onEdit(service)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
          <button type="button" onClick={() => onDelete(service)} className="rounded-lg bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:bg-rose-700">Delete</button>
          <button type="button" onClick={() => onToggle(service)} className="rounded-lg bg-sky-600 px-2 py-2 text-xs font-semibold text-white hover:bg-sky-700">{enabled ? "Disable" : "Enable"}</button>
        </div>
      </div>
    </div>
  );
}
