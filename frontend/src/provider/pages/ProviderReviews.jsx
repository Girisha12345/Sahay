import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";
import { Spinner } from "../../components/ui/spinner";
import api from "../../services/api";
import { providerServiceApi } from "../../services/providerServiceApi";
import { useAuthStore } from "../../store/authStore";

export function ProviderReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setReviews([]);
      return;
    }

    Promise.all([api.get(`reviews/provider/${user.id}/`), providerServiceApi.getMyServices()])
      .then(([reviewResponse, serviceResponse]) => {
        setReviews(reviewResponse.data ?? []);
        setServices(serviceResponse.data ?? []);
      })
      .catch(() => setError("Could not load reviews."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const serviceMap = new Map(services.map((service) => [service.id, service.title]));

  const average = useMemo(() => {
    if (!reviews.length) return "0.0";
    const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) {
    return (
      <ProviderLayout title="Reviews & Ratings" subtitle="Understand customer feedback and improve service quality">
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      </ProviderLayout>
    );
  }

  if (error) {
    return (
      <ProviderLayout title="Reviews & Ratings" subtitle="Understand customer feedback and improve service quality">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="Reviews & Ratings" subtitle="Understand customer feedback and improve service quality">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <h3 className="text-xl font-bold text-slate-900">{average} / 5</h3>
          <p className="text-sm text-slate-500">({reviews.length} reviews)</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="font-semibold text-slate-600">No reviews yet</p>
          <p className="mt-1 text-sm text-slate-400">Reviews appear here after customers rate completed bookings.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{review.customer_name || review.customer || "Customer"}</p>
                  <p className="text-sm text-slate-500">Service: {serviceMap.get(review.service) || `#${review.service}`}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Number(review.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                  ))}
                </div>
              </div>
              {review.comment && <p className="mt-3 text-sm text-slate-700">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </ProviderLayout>
  );
}
