import { Card } from "../../components/ui/card";

const pendingProviders = [
  { id: 1, name: "Rahul Sharma", skill: "Plumber" },
  { id: 2, name: "Neha Rao", skill: "Electrician" },
];

export function AdminProvidersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Approve Providers</h1>
      <div className="mt-5 grid gap-3">
        {pendingProviders.map((provider) => (
          <Card key={provider.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{provider.name}</p>
              <p className="text-sm text-slate-500">{provider.skill}</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
              <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">Reject</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
