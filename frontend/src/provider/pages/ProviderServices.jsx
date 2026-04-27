import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderLayout } from "../components/ProviderLayout";
import { ServiceCard } from "../components/ServiceCard";
import { Spinner } from "../../components/ui/spinner";
import { providerServiceApi } from "../../services/providerServiceApi";

export function ProviderServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    providerServiceApi
      .getMyServices()
      .then((res) => setServices(res.data ?? []))
      .catch(() => setError("Could not load services."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (service) => {
    if (!window.confirm("Delete this service permanently?")) return;
    await providerServiceApi.deleteService(service.id);
    setServices((prev) => prev.filter((s) => s.id !== service.id));
  };

  const handleToggle = async (service) => {
    const res = await providerServiceApi.toggleService(service.id);
    setServices((prev) => prev.map((s) => (s.id === service.id ? res.data : s)));
  };

  return (
    <ProviderLayout
      title="My Services"
      subtitle="Create, manage, and optimize your service catalog"
      rightContent={
        <button type="button" onClick={() => navigate("/provider/add-service")} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Add Service
        </button>
      }
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="font-semibold text-slate-600">No services yet</p>
          <p className="mt-1 text-sm text-slate-400">Go to Add Service to create your first listing.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={(s) => navigate(`/provider/services/edit/${s.id}`)}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}
