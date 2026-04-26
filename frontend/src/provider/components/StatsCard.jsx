import { ArrowUpRight } from "lucide-react";

export function StatsCard({ title, value, subtitle, icon: Icon, accent = "sky" }) {
  const accents = {
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="flex h-full min-h-[164px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold leading-none text-slate-900">{value}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accents[accent] || accents.sky}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-slate-500">
        <ArrowUpRight className="h-3.5 w-3.5" />
        Updated just now
      </div>
    </div>
  );
}
