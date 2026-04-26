import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProviderLayout } from "../components/ProviderLayout";
import { ServiceCard } from "../components/ServiceCard";
import { servicesFallback } from "../mockData";

export function ProviderServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState(servicesFallback);

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={(s) => navigate(`/provider/services/edit/${s.id}`)}
            onDelete={(s) => setServices((prev) => prev.filter((item) => item.id !== s.id))}
            onToggle={(s) =>
              setServices((prev) =>
                prev.map((item) => (item.id === s.id ? { ...item, enabled: !item.enabled } : item)),
              )
            }
          />
        ))}
      </div>
    </ProviderLayout>
  );
}
