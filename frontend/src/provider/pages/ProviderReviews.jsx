import { useMemo } from "react";
import { Star } from "lucide-react";

import { ProviderLayout } from "../components/ProviderLayout";
import { reviewsFallback } from "../mockData";

export function ProviderReviews() {
  const average = useMemo(() => {
    const total = reviewsFallback.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviewsFallback.length).toFixed(1);
  }, []);

  return (
    <ProviderLayout title="Reviews & Ratings" subtitle="Understand customer feedback and improve service quality">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <h3 className="text-xl font-bold text-slate-900">{average} / 5</h3>
          <p className="text-sm text-slate-500">({reviewsFallback.length} reviews)</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {reviewsFallback.map((review) => (
          <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{review.customer}</p>
                <p className="text-sm text-slate-500">Service: {review.service}</p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </ProviderLayout>
  );
}
