import type { ServiceReview } from "../../types";
import { Card } from "../ui/card";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { parseISO, formatDistanceToNow } from "date-fns";

interface RatingsReviewsProps {
  averageRating: number;
  totalReviews: number;
  reviews: ServiceReview[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export function RatingsReviews({
  averageRating,
  totalReviews,
  reviews = [],
}: RatingsReviewsProps) {
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-slate-600">Overall Rating</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</p>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{totalReviews} customer reviews</p>
          </div>

          {/* Rating Distribution Chart */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars as keyof typeof ratingDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 w-12">{stars}⭐</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 ? (
        <div className="grid gap-3">
          <h3 className="font-semibold text-slate-900 text-lg">Recent Reviews</h3>
          {reviews.slice(0, 5).map((review) => {
            const reviewDate = parseISO(review.created_at);
            return (
              <Card key={review.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{review.user_name || "Customer"}</p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(reviewDate, { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
                  <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-600 transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                    Helpful
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No reviews yet</p>
          <p className="text-xs text-slate-500 mt-1">Complete some jobs to receive reviews from customers</p>
        </Card>
      )}
    </div>
  );
}
