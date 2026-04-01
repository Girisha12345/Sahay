import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ServiceCard } from "../../components/cards/service-card";
import { EmptyState } from "../../components/ui/empty-state";
import { Input } from "../../components/ui/input";
import { useServiceStore } from "../../store/serviceStore";

export function ServicesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { services } = useServiceStore();
  const [price, setPrice] = useState(10000);
  const [rating, setRating] = useState(0);

  const category = Number(searchParams.get("category") || 0);

  const filtered = useMemo(
    () =>
      services.filter((service) => {
        const categoryMatch = category ? service.category.id === category : true;
        const priceMatch = Number(service.base_price) <= price;
        const ratingMatch = (service.rating ?? 4.5) >= rating;
        return categoryMatch && priceMatch && ratingMatch;
      }),
    [services, category, price, rating],
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">Services</h1>
      <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <div>
          <label className="text-xs text-slate-500">Max Price</label>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Min Rating</label>
          <Input type="number" min={0} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Location</label>
          <Input placeholder="Bengaluru" />
        </div>
        <div>
          <label className="text-xs text-slate-500">Availability</label>
          <Input placeholder="Today / Tomorrow" />
        </div>
      </div>

      {!filtered.length ? (
        <div className="mt-6">
          <EmptyState title="No services found" subtitle="Try changing your filters." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} onBook={(serviceId) => navigate(`/booking/${serviceId}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
