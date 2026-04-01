import { Card } from "../../components/ui/card";

export function ProviderProfilePage() {
  return (
    <Card className="max-w-2xl">
      <h1 className="text-2xl font-bold">Provider Profile</h1>
      <p className="mt-2 text-sm text-slate-500">Update skills, experience and hourly rate from this page.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="h-11 rounded-xl border border-slate-300 px-3" placeholder="Skills" />
        <input className="h-11 rounded-xl border border-slate-300 px-3" placeholder="Experience (years)" />
        <input className="h-11 rounded-xl border border-slate-300 px-3 md:col-span-2" placeholder="Hourly Rate" />
      </div>
    </Card>
  );
}
