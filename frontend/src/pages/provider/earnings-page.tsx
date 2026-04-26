import { useEffect, useState } from "react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { paymentService } from "../../services/paymentService";
import type { ProviderWallet } from "../../types";

export function ProviderEarningsPage() {
  const [wallet, setWallet] = useState<ProviderWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    paymentService.getWallet()
      .then((res) => setWallet(res.data))
      .catch(() => setError("Failed to load wallet data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!wallet) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Earnings</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total Earned</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            ₹{parseFloat(wallet.total_earned).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Commission Deducted (10%)</p>
          <p className="mt-1 text-2xl font-bold text-red-500">
            ₹{parseFloat(wallet.total_commission_deducted).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending Payout</p>
          <p className="mt-1 text-2xl font-bold text-sky-600">
            ₹{parseFloat(wallet.pending_payout).toFixed(2)}
          </p>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">Transaction History</h2>
        {wallet.transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {wallet.transactions.map((tx) => (
              <Card key={tx.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={
                      tx.tx_type === "CREDIT"
                        ? "text-green-600 font-bold"
                        : "text-red-500 font-bold"
                    }
                  >
                    {tx.tx_type === "CREDIT" ? "+" : "-"}
                    ₹{parseFloat(tx.amount).toFixed(2)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
