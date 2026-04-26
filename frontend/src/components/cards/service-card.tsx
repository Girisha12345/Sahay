import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StarRating } from "../StarRating";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { currency } from "../../utils/format";
import type { ServiceItem } from "../../types";
import { useAuthStore } from "../../store/authStore";

export function ServiceCard({ service, onBook }: { service: ServiceItem; onBook: (serviceId: number) => void }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const reviewCount = Number(service.review_count ?? service.total_reviews ?? 0);
  const hasReviews = reviewCount > 0;
  const displayRating = Number(service.average_rating ?? service.rating ?? 0).toFixed(1);

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <button className="text-left text-lg font-semibold text-slate-900 hover:text-sky-700" onClick={() => navigate(`/services/${service.id}`)}>
          {service.title}
        </button>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900">{currency(service.base_price)}</p>
          {hasReviews ? (
            <button
              type="button"
              onClick={() => navigate(`/services/${service.id}`)}
              className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
            >
              <StarRating rating={Number(displayRating)} /> {displayRating} <span className="text-slate-500">({reviewCount} reviews)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/services/${service.id}`)}
              className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-700 transition hover:bg-yellow-100"
            >
              <Star className="h-3.5 w-3.5 text-yellow-500" /> New
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate(`/services/${service.id}`)}
        >
          View Details & Rate
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            if (user) {
              onBook(service.id);
            } else {
              const nextPath = encodeURIComponent(`/checkout?serviceId=${service.id}`);
              navigate(`/login?next=${nextPath}`);
            }
          }}
        >
          Book Now
        </Button>
      </div>
    </Card>
  );
}
