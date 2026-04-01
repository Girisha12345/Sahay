import { Card } from "../../components/ui/card";

export function ProviderEarningsPage() {
  return (
    <Card className="max-w-xl">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="mt-2 text-sm text-slate-500">Track completed payouts and upcoming releases.</p>
      <div className="mt-5 rounded-xl bg-emerald-50 p-4">
        <p className="text-sm text-emerald-700">Total Earnings</p>
        <p className="text-2xl font-black text-emerald-800">INR 0.00</p>
      </div>
    </Card>
  );
}
