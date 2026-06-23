import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { BookingCard } from "../../components/cards/booking-card";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { Spinner } from "../../components/ui/spinner";
import { reviewService } from "../../services/reviewService";
import { useBookingStore } from "../../store/bookingStore";
import { useServiceStore } from "../../store/serviceStore";
import type { Booking } from "../../types";

export function CustomerBookingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { bookings, loading, fetchCustomerBookings } = useBookingStore();
  const { services } = useServiceStore();
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

  const routeBookingId = Number(id || 0);
  const activeBooking = useMemo(
    () => (routeBookingId ? bookings.find((item) => item.id === routeBookingId) || null : null),
    [bookings, routeBookingId],
  );
  const activeServiceName = useMemo(
    () => services.find((item) => item.id === activeBooking?.service)?.title || "Service",
    [activeBooking?.service, services],
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

  if (id && routeBookingId && !activeBooking) {
    return (
      <div>
        <BackButton />
        <Card className="mt-4 p-6">
          <div className="space-y-3">
            <p className="text-red-600">Booking not found.</p>
            <Button onClick={() => navigate("/customer/bookings")}>Back to bookings</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <h1 className="text-2xl font-bold">{activeBooking ? `Booking #${activeBooking.id}` : "My Bookings"}</h1>
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

      {activeBooking && (
        <Card className="mt-5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Booking Details</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{activeServiceName}</h2>
              <p className="mt-1 text-sm text-slate-500">Booking ID #{activeBooking.id}</p>
            </div>
            <div className="flex gap-2">
              {(activeBooking.status === "PENDING_PAYMENT" || activeBooking.status === "PAYMENT_REJECTED") && (
                <Button
                  onClick={() => navigate(`/payment/${activeBooking.id}`)}
                  className="bg-[#5f259f] hover:bg-[#4d1d82] text-white font-bold"
                >
                  Proceed to Payment
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate("/customer/bookings")}>
                Back to all bookings
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{activeBooking.status}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {activeBooking.scheduled_date} at {activeBooking.scheduled_time}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{activeBooking.payment_method.toUpperCase()}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">₹{activeBooking.total_price}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 md:col-span-2 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{activeBooking.address}</p>
              <p className="mt-1 text-sm text-slate-500">
                {activeBooking.locality} • {activeBooking.pincode}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 md:col-span-2 lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provider</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{activeBooking.provider_name || activeBooking.provider}</p>
            </div>
            {activeBooking.notes && (
              <div className="rounded-xl bg-slate-50 p-4 md:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{activeBooking.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {!activeBooking &&
          bookings.map((booking) => (
            <div key={booking.id} className="space-y-2">
              <BookingCard booking={booking} />

              <div className="flex gap-2">
                {(booking.status === "PENDING_PAYMENT" || booking.status === "PAYMENT_REJECTED") && (
                  <Button
                    onClick={() => navigate(`/payment/${booking.id}`)}
                    className="flex-1 bg-[#5f259f] hover:bg-[#4d1d82] text-white font-bold"
                  >
                    Proceed to Payment
                  </Button>
                )}

                <Button 
                  variant="secondary" 
                  onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                  className="flex-1"
                >
                  View Details
                </Button>
              </div>

              {booking.status === "COMPLETED" && !booking.has_review && (
                <Button variant="secondary" onClick={() => openReviewForm(booking)} className="w-full">
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
