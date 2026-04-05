import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { BookingCard } from "../../components/cards/booking-card";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { Spinner } from "../../components/ui/spinner";
import { reviewService } from "../../services/reviewService";
import { useBookingStore } from "../../store/bookingStore";
import type { Booking } from "../../types";

export function CustomerBookingsPage() {
  const location = useLocation();
  const { bookings, loading, fetchCustomerBookings } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const completedUnreviewedCount = useMemo(
    () => bookings.filter((item) => item.status === "COMPLETED" && !item.has_review).length,
    [bookings],
  );

  useEffect(() => {
    void fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  const openReviewForm = (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setFormError(null);
    setSuccessMessage(null);
  };

  const closeReviewForm = () => {
    setSelectedBooking(null);
    setFormError(null);
  };

  const handleReviewSubmit = async () => {
    if (!selectedBooking) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await reviewService.create({
        booking: selectedBooking.id,
        rating,
        comment: comment.trim(),
      });
      await fetchCustomerBookings();
      setSuccessMessage("Thanks for your feedback. Your rating was submitted successfully.");
      closeReviewForm();
    } catch (error) {
      setFormError((error as Error).message || "Unable to submit your review right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!bookings.length) return <EmptyState title="No bookings yet" subtitle="Book your first service to get started." />;

  return (
    <div>
      <BackButton />
      <h1 className="text-2xl font-bold">My Bookings</h1>
      {location.state?.successMessage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {location.state.successMessage}
        </div>
      )}
      {successMessage && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}
      {completedUnreviewedCount > 0 && (
        <p className="mt-3 text-sm text-slate-500">
          You have {completedUnreviewedCount} completed booking{completedUnreviewedCount > 1 ? "s" : ""} waiting for rating.
        </p>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <div key={booking.id} className="space-y-2">
            <BookingCard booking={booking} />

            {booking.status === "COMPLETED" && !booking.has_review && (
              <Button variant="secondary" onClick={() => openReviewForm(booking)}>
                Rate Service
              </Button>
            )}

            {booking.status === "COMPLETED" && booking.has_review && (
              <p className="text-sm font-medium text-emerald-700">Rated: ⭐ {booking.review_rating?.toFixed(1) || "5.0"}</p>
            )}
          </div>
        ))}
      </div>

      {selectedBooking && (
        <Card className="mt-6 rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Rate Booking #{selectedBooking.id}</h2>
          <p className="mt-1 text-sm text-slate-500">Share your experience so other customers can make better decisions.</p>

          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="rounded p-1 transition hover:bg-amber-50"
                aria-label={`Set rating to ${star}`}
              >
                <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
            <span className="ml-1 text-sm font-medium text-slate-600">{rating}.0 / 5</span>
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Write a short review (optional)"
            className="mt-4 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

          <div className="mt-4 flex gap-2">
            <Button onClick={() => void handleReviewSubmit()} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
            <Button variant="secondary" onClick={closeReviewForm} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
