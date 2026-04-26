import { useEffect, useState } from "react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { adminService, type PendingProvider } from "../../services/adminService";

export function AdminProvidersPage() {
  const [providers, setProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProviders = async () => {
      try {
        const { data } = await adminService.getPendingProviders();
        if (isMounted) {
          setProviders(data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage((error as Error).message || "Unable to load pending providers.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = async (providerId: number, action: "approve" | "reject") => {
    setMessage(null);
    try {
      if (action === "approve") {
        await adminService.approveProvider(providerId);
      } else {
        await adminService.rejectProvider(providerId);
      }
      setProviders((current) => current.filter((provider) => provider.id !== providerId));
      setMessage(`Provider ${action}d successfully.`);
    } catch (error) {
      setMessage((error as Error).message || "Unable to update provider status.");
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-10">
        <Spinner />
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Approve Providers</h1>
      {message && <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</p>}
      <div className="mt-5 grid gap-3">
        {providers.map((provider) => (
          <Card key={provider.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">
                {typeof provider.user === "string"
                  ? provider.user
                  : `${provider.user?.first_name || ""} ${provider.user?.last_name || ""}`.trim() ||
                    provider.user?.email ||
                    `Provider #${provider.id}`}
              </p>
              <p className="text-sm text-slate-500">{provider.skills?.join(", ") || provider.city || "Pending verification"}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => handleAction(provider.id, "approve")}
              >
                Approve
              </button>
              <button
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => handleAction(provider.id, "reject")}
              >
                Reject
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
