import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import {
  CheckCircle2,
  Download,
  Share2,
  ArrowRight,
  Copy,
  AlertCircle,
} from "lucide-react";
import checkoutService from "../services/checkoutService";
import { currency } from "../utils/format";
import type { Booking } from "../types";

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("No booking found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await checkoutService.getBooking(bookingId);
        setBooking(data);
      } catch (err) {
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCopyId = () => {
    if (booking?.id) {
      navigator.clipboard.writeText(String(booking.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Spinner />
          </div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Error
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {error || "Could not load booking details. Please try again."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Home
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "IN_PROGRESS":
      case "ACCEPTED":
        return "text-emerald-600";
      case "PENDING":
      case "PENDING_PAYMENT":
        return "text-yellow-600";
      case "CANCELLED":
      case "REFUNDED":
      case "DISPUTED":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "IN_PROGRESS":
      case "ACCEPTED":
        return "bg-emerald-100";
      case "PENDING":
      case "PENDING_PAYMENT":
        return "bg-yellow-100";
      case "CANCELLED":
      case "REFUNDED":
      case "DISPUTED":
        return "bg-red-100";
      default:
        return "bg-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4 animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-slate-600">
            Your service request has been placed successfully
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6 rounded-2xl border border-slate-200 p-8 shadow-lg">
          {/* Booking ID */}
          <div className="mb-6 border-b border-slate-200 pb-6">
            <p className="text-sm text-slate-600 mb-1">Booking ID</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-900 font-mono">
                {String(booking.id)}
              </p>
              <button
                onClick={handleCopyId}
                className="rounded-lg p-2 hover:bg-slate-100 transition"
              >
                <Copy className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-sm text-emerald-600">
                ✓ Booking ID copied to clipboard
              </p>
            )}
          </div>

          {/* Order Timeline */}
          <div className="mb-8 space-y-4">
            <h3 className="font-semibold text-slate-900">Order Status</h3>
            <div className="space-y-3">
              {[
                {
                  step: "Payment Confirmed",
                  done:
                    booking.payment_status === "PAID" ||
                    booking.payment_status === "RELEASED",
                  time: new Date(booking.created_at).toLocaleDateString(),
                },
                {
                  step: "Service Scheduled",
                  done:
                    booking.status === "CONFIRMED" ||
                    booking.status === "ACCEPTED" ||
                    booking.status === "IN_PROGRESS" ||
                    booking.status === "COMPLETED",
                  time: booking.scheduled_date,
                },
                {
                  step: "Service Completed",
                  done: booking.status === "COMPLETED",
                  time: "-",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                        item.done ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      {item.done ? "✓" : idx + 1}
                    </div>
                    {idx < 2 && (
                      <div
                        className={`my-1 h-8 w-0.5 ${
                          item.done ? "bg-emerald-600" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium ${getStatusColor(booking.status)}`}>
                      {item.step}
                    </p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8 border-t border-slate-200 pt-6 grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Booking Date</p>
              <p className="font-medium text-slate-900">
                {new Date(booking.scheduled_date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Booking Time</p>
              <p className="font-medium text-slate-900">{booking.scheduled_time}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Payment Method</p>
              <p className="font-medium text-slate-900 capitalize">
                {booking.payment_method}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Payment Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBg(
                  booking.payment_status || "INITIATED"
                )} ${getStatusColor(booking.payment_status || "INITIATED")}`}
              >
                {booking.payment_status === "PAID"
                  ? "Paid"
                  : booking.payment_status === "INITIATED"
                  ? "Processing"
                  : booking.payment_status === "RELEASED"
                  ? "Released"
                  : booking.payment_status === "FAILED"
                  ? "Failed"
                  : booking.payment_status === "REFUNDED"
                  ? "Refunded"
                  : "Pending"}
              </span>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-600">Service Amount</span>
              <span className="font-medium text-slate-900">
                {currency(booking.total_price)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-900">Total Paid</span>
              <span className="text-2xl font-bold text-sky-600">
                {currency(booking.total_price)}
              </span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="w-full gap-2"
          >
            View Booking Details
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                const message = `I've placed a service booking with ID: ${booking.id}. Check it out on Sahāy!`;
                const url = encodeURIComponent(message);
                window.open(`https://wa.me/?text=${url}`, "_blank");
              }}
              className="flex-1 gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Invoice
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="rounded-xl border border-slate-200 p-6 bg-sky-50">
          <h3 className="font-semibold text-slate-900 mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="text-sky-600 font-bold">•</span>
              A confirmation email has been sent
            </li>
            <li className="flex gap-2">
              <span className="text-sky-600 font-bold">•</span>
              The service provider will contact you soon to confirm details
            </li>
            <li className="flex gap-2">
              <span className="text-sky-600 font-bold">•</span>
              You can track your booking status in your dashboard
            </li>
            <li className="flex gap-2">
              <span className="text-sky-600 font-bold">•</span>
              Rate and review the service after completion
            </li>
          </ul>
        </Card>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Button
            variant="secondary"
            onClick={() => navigate("/services")}
            className="gap-2"
          >
            Browse More Services
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
