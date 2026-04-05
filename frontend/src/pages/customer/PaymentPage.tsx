import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { bookingService } from "../../services/bookingService";
import { paymentService } from "../../services/paymentService";
import { serviceService } from "../../services/serviceService";
import { useAuthStore } from "../../store/authStore";
import { currency } from "../../utils/format";
import type { Booking, ServiceItem } from "../../types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

type PaymentOption = {
  label: string;
  description: string;
  value: "upi" | "googlepay" | "phonepe" | "razorpay";
  badge?: string;
};

type RouterState = {
  bookingId?: number;
  serviceId?: number;
  paymentMethod?: Booking["payment_method"];
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  { value: "upi", label: "UPI", description: "Pay using any UPI-enabled app", badge: "Fast" },
  { value: "googlepay", label: "Google Pay", description: "Secure checkout through Google Pay" },
  { value: "phonepe", label: "PhonePe", description: "Complete payment using PhonePe" },
  { value: "razorpay", label: "Razorpay Secure Payment", description: "Cards, Net Banking, Wallets, and UPI" },
];

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function PaymentPage() {
  const navigate = useNavigate();
  const { bookingId: bookingIdParam } = useParams();
  const location = useLocation();
  const routerState = (location.state || {}) as RouterState;
  const { user } = useAuthStore();

  const bookingId = Number(bookingIdParam || routerState.bookingId || 0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Booking["payment_method"]>(
    routerState.paymentMethod || "razorpay",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setErrorMessage("Booking not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [{ data: bookingList }] = await Promise.all([bookingService.customerBookings()]);
        const matchedBooking = (bookingList as Booking[]).find((item) => item.id === bookingId) || null;
        if (!matchedBooking) {
          throw new Error("Booking not found.");
        }

        setBooking(matchedBooking);
        setSelectedPaymentMethod(matchedBooking.payment_method || routerState.paymentMethod || "razorpay");
        const { data: serviceData } = await serviceService.serviceById(matchedBooking.service);
        setService(serviceData as ServiceItem);
      } catch (error) {
        setErrorMessage((error as Error).message || "Unable to load payment details.");
      } finally {
        setLoading(false);
      }
    };

    void loadBooking();
  }, [bookingId, routerState.paymentMethod]);

  const basePrice = Number(service?.base_price || 0);
  const platformFee = useMemo(() => Number((basePrice * 0.1).toFixed(2)), [basePrice]);
  const totalAmount = useMemo(() => Number((basePrice + platformFee).toFixed(2)), [basePrice, platformFee]);

  const handlePayment = async () => {
    if (!booking) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      if (selectedPaymentMethod !== booking.payment_method) {
        const { data } = await bookingService.updatePaymentMethod({
          booking_id: booking.id,
          payment_method: selectedPaymentMethod,
        });
        setBooking(data as Booking);
      }

      const orderResponse = await paymentService.createOrder({ booking_id: booking.id, amount: totalAmount });
      const orderId = orderResponse?.data?.order_id as string | undefined;
      const paymentKey = orderResponse?.data?.payment_key as string | undefined;

      if (!orderId || !paymentKey) {
        throw new Error("Unable to initialize secure payment.");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Payment gateway failed to load. Please retry.");
      }

      if (!window.Razorpay || paymentKey === "mock_key_local") {
        const mockPaymentId = `pay_mock_${booking.id}`;
        await paymentService.verifyPayment({
          booking_id: booking.id,
          payment_id: mockPaymentId,
          order_id: orderId,
          signature: "mock_signature",
        });
        navigate("/payment/success", {
          replace: true,
          state: {
            bookingId: booking.id,
            serviceName: service?.title,
            transactionId: mockPaymentId,
            amount: totalAmount,
          },
        });
        return;
      }

      const rzp = new window.Razorpay({
        key: paymentKey,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Sahāy",
        description: "Service Booking Payment",
        order_id: orderId,
        theme: { color: "#0284c7" },
        prefill: {
          name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
          email: user?.email || "",
          contact: user?.phone_number || "",
        },
        notes: {
          booking_id: String(booking.id),
          service_name: service?.title || "Service Booking",
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          await paymentService.verifyPayment({
            booking_id: booking.id,
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
          navigate("/payment/success", {
            replace: true,
            state: {
              bookingId: booking.id,
              serviceName: service?.title,
              transactionId: response.razorpay_payment_id,
              amount: totalAmount,
            },
          });
        },
      });

      rzp.on("payment.failed", () => {
        setErrorMessage("Payment failed. Please try another method or retry.");
      });

      rzp.open();
    } catch (error) {
      setErrorMessage((error as Error).message || "Payment could not be completed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center py-16">
        <Card className="w-full max-w-md text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-500">Preparing secure payment...</p>
        </Card>
      </div>
    );
  }

  if (!booking || !service) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <div className="space-y-3">
            <p className="text-red-600">{errorMessage || "Payment details are unavailable."}</p>
            <Button onClick={() => navigate("/customer/bookings")}>Back to bookings</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border p-5 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Secure Checkout</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">Proceed to Payment</h1>
                <p className="mt-1 text-sm text-slate-500">Review your order and choose a payment method.</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Secure payment gateway
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border p-5 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
            <p className="mt-1 text-sm text-slate-500">Select how you would like to complete this booking.</p>
            <div className="mt-4 space-y-3">
              {PAYMENT_OPTIONS.map((method) => (
                <label
                  key={`${method.label}-${method.value}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-sky-300 hover:bg-sky-50 ${
                    selectedPaymentMethod === method.value ? "border-sky-400 bg-sky-50" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.value}
                    checked={selectedPaymentMethod === method.value}
                    onChange={() => setSelectedPaymentMethod(method.value)}
                    className="mt-1 h-4 w-4 accent-sky-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{method.label}</span>
                      {method.label === "Razorpay Secure Payment" && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="rounded-xl border p-5 shadow-md">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Card details are never stored by Sahāy. Payments are processed through Razorpay Secure Payment.
            </div>
            {errorMessage && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
            <Button className="mt-4 w-full gap-2" onClick={handlePayment} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Pay Securely
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border p-5 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Service</span>
                <span className="font-medium text-slate-900 text-right">{service.title}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Service Price</span>
                <span className="font-medium text-slate-900">{currency(basePrice)}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="text-slate-500">Platform Fee (10%)</span>
                <span className="font-medium text-slate-900">{currency(platformFee)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-1">
                <span className="text-base font-semibold text-slate-900">Total Amount</span>
                <span className="text-base font-bold text-sky-600">{currency(totalAmount)}</span>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border p-5 shadow-md">
            <h3 className="font-semibold text-slate-900">Booking Details</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Booking ID: #{booking.id}</p>
              <p>Provider: {booking.provider_name || "Assigned provider"}</p>
              <p>Payment Method: {selectedPaymentMethod.toUpperCase()}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
