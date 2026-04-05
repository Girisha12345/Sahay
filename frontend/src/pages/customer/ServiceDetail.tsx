import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ReviewForm } from "../../components/ReviewForm";
import { StarRating } from "../../components/StarRating";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { reviewService } from "../../services/reviewService";
import { serviceService } from "../../services/serviceService";
import { useAuthStore } from "../../store/authStore";
import type { ServiceItem, ServiceReview } from "../../types";
import { currency } from "../../utils/format";

export function ServiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const serviceId = Number(id || 0);
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [service, setService] = useState<ServiceItem | null>(null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);

  const refreshData = async () => {
    if (!serviceId) return;
    const [{ data: serviceData }, { data: reviewData }] = await Promise.all([
      serviceService.serviceById(serviceId),
      reviewService.list(serviceId),
    ]);
    setService(serviceData as ServiceItem);
    setReviews((reviewData || []) as ServiceReview[]);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        await refreshData();
      } catch (loadError) {
        setError((loadError as Error).message || "Unable to load service details.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [serviceId]);

  const handleSubmitReview = async (payload: { service: number; rating: number; comment?: string }) => {
    setSubmitting(true);
    setError("");
    try {
      await reviewService.create(payload);
      await refreshData();
    } catch (submitError) {
      setError((submitError as Error).message || "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = useMemo(() => {
    if (!service) return 0;
    return Number(service.average_rating ?? service.rating ?? 0);
  }, [service]);

  const reviewCount = useMemo(() => {
    if (!service) return 0;
    return Number(service.review_count ?? service.total_reviews ?? 0);
  }, [service]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!service) {
    return (
      <Card>
        <p className="text-red-600">Service not found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>

      <Card className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">{service.title}</h1>
        <p className="text-slate-600">{service.description}</p>
        <p className="text-xl font-bold text-slate-900">{currency(service.base_price)}</p>

        <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-sm font-medium">
          <StarRating rating={displayRating} />
          <span>{reviewCount > 0 ? displayRating.toFixed(1) : "New"}</span>
          {reviewCount > 0 && <span className="text-slate-500">({reviewCount} reviews)</span>}
        </div>
      </Card>

      {isAuthenticated ? (
        <ReviewForm serviceId={serviceId} onSubmitReview={handleSubmitReview} submitting={submitting} />
      ) : (
        <Card>
          <p className="text-sm text-slate-600">Login to submit a review.</p>
        </Card>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Customer Reviews</h2>
        {reviews.length ? (
          reviews.map((review) => (
            <Card key={review.id} className="border rounded-lg p-3 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{review.user_name || "Customer"}</p>
                <div className="inline-flex items-center gap-1 text-yellow-600">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{review.comment || "No comment"}</p>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-slate-500">No reviews yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
