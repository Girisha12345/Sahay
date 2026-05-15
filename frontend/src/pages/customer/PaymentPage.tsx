import { CreditCard, Loader2, ShieldCheck, QrCode, Smartphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
    Stripe?: (publishableKey: string) => {
      elements: () => {
        create: (type: string) => {
          mount: (selector: string | HTMLElement) => void;
          destroy: () => void;
        };
      };
      confirmCardPayment: (clientSecret: string, options: Record<string, unknown>) => Promise<{
        paymentIntent?: {
          id: string;
          status: string;
        };
        error?: { message?: string };
      }>;
    };
  }
}

type CheckoutPaymentMethod = Booking["payment_method"] | "stripe";

type PaymentOption = {
  label: string;
  description: string;
  value: CheckoutPaymentMethod;
  badge?: string;
};

type RouterState = {
  bookingId?: number;
  serviceId?: number;
  paymentMethod?: Booking["payment_method"];
};

type UpiSession = {
  orderId: string;
  txnRef: string;
  upiUri: string;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  { value: "upi", label: "UPI", description: "Pay using any UPI-enabled app", badge: "Fast" },
  { value: "googlepay", label: "Google Pay", description: "Secure checkout through Google Pay" },
  { value: "phonepe", label: "PhonePe", description: "Complete payment using PhonePe" },
  { value: "razorpay", label: "Razorpay Secure Payment", description: "Cards, Net Banking, Wallets, and UPI" },
  { value: "stripe", label: "Card (Stripe)", description: "Pay by card after the provider accepts the booking" },
  { value: "cash", label: "Cash on Service", description: "Pay cash after service completion" },
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod>(
    routerState.paymentMethod || "razorpay",
  );
  const [upiSession, setUpiSession] = useState<UpiSession | null>(null);
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeElements, setStripeElements] = useState<{ destroy: () => void } | null>(null);
  const stripeCardRef = useRef<HTMLDivElement | null>(null);

  const upiId = (import.meta.env.VITE_UPI_ID as string) || "sahay@upi";
  const upiPayeeName = (import.meta.env.VITE_UPI_PAYEE_NAME as string) || "Sahay Services";
  const stripePublishableKeyEnv = (import.meta.env.VITE_STRIPE_PUBLIC_KEY as string) || "";

  useEffect(() => {
    if (selectedPaymentMethod !== "stripe") {
      setStripeReady(false);
      if (stripeElements) {
        stripeElements.destroy();
        setStripeElements(null);
      }
      return;
    }

    let isMounted = true;

    const loadStripeScript = () =>
      new Promise<boolean>((resolve) => {
        if (window.Stripe) {
          resolve(true);
          return;
        }

        const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
        if (existing) {
          existing.addEventListener("load", () => resolve(true), { once: true });
          existing.addEventListener("error", () => resolve(false), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    const initializeStripe = async () => {
      const loaded = await loadStripeScript();
      if (!loaded || !isMounted) {
        if (isMounted) {
          setErrorMessage("Stripe checkout failed to load.");
        }
        return;
      }

      if (!stripeCardRef.current) {
        return;
      }

      const stripe = window.Stripe?.(stripePublishableKeyEnv);
      if (!stripe) {
        if (isMounted) {
          setErrorMessage("Stripe is not configured.");
        }
        return;
      }

      const elements = stripe.elements();
      const card = elements.create("card");
      card.mount(stripeCardRef.current);
      if (isMounted) {
        setStripeElements({ destroy: () => card.destroy() });
        setStripeReady(true);
      }
    };

    void initializeStripe();

    return () => {
      isMounted = false;
      if (stripeElements) {
        stripeElements.destroy();
        setStripeElements(null);
      }
    };
  }, [selectedPaymentMethod]);

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

  const isUpiFlow =
    selectedPaymentMethod === "upi" ||
    selectedPaymentMethod === "googlepay" ||
    selectedPaymentMethod === "phonepe";

  const buildUpiUri = (bookingRef: number, amount: number) => {
    const txnRef = `sahay_${bookingRef}_${Date.now()}`;
    const uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiPayeeName,
    )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Booking ${bookingRef}`)}&tr=${encodeURIComponent(txnRef)}`;
    return { txnRef, uri };
  };

  const handleUpiVerification = async () => {
    if (!booking || !upiSession) return;

    setVerifyingUpi(true);
    setErrorMessage(null);
    try {
      const upiPaymentId = `upi_${upiSession.txnRef}`;
      await paymentService.verifyPayment({
        booking_id: booking.id,
        payment_id: upiPaymentId,
        order_id: upiSession.orderId,
        signature: "",
      });

      navigate("/payment/success", {
        replace: true,
        state: {
          bookingId: booking.id,
          serviceName: service?.title,
          transactionId: upiPaymentId,
          amount: totalAmount,
        },
      });
    } catch (error) {
      setErrorMessage((error as Error).message || "Unable to verify UPI payment. Please try again.");
    } finally {
      setVerifyingUpi(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      if (selectedPaymentMethod === "stripe") {
        if (!booking.status || !["ACCEPTED", "CONFIRMED", "PENDING_PAYMENT"].includes(booking.status)) {
          throw new Error("Stripe payments are available after the provider accepts your booking.");
        }

        const stripeResponse = await paymentService.createStripeIntent({ booking_id: booking.id });
        const clientSecret = stripeResponse?.data?.client_secret as string | undefined;
        const publishableKey = stripeResponse?.data?.publishable_key as string | undefined;
        if (!clientSecret || !publishableKey) {
          throw new Error("Unable to initialize Stripe checkout.");
        }

        if (!window.Stripe) {
          throw new Error("Stripe checkout library failed to load.");
        }

        const stripe = window.Stripe(publishableKey);
        const elements = stripe.elements();
        const card = elements.create("card");

        if (!stripeCardRef.current) {
          throw new Error("Stripe card input is not ready.");
        }

        card.mount(stripeCardRef.current);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card,
            billing_details: {
              name: user?.first_name || undefined,
              email: user?.email || undefined,
            },
          },
        });

        card.destroy();

        if (result.error) {
          throw new Error(result.error.message || "Stripe payment failed.");
        }

        if (!result.paymentIntent?.id) {
          throw new Error("Stripe payment did not return a payment intent.");
        }

        await paymentService.verifyPayment({
          booking_id: booking.id,
          payment_id: result.paymentIntent.id,
          order_id: result.paymentIntent.id,
          signature: "",
        });

        navigate("/payment/success", {
          replace: true,
          state: {
            bookingId: booking.id,
            serviceName: service?.title,
            transactionId: result.paymentIntent.id,
            amount: totalAmount,
          },
        });
        return;
      }

      if (selectedPaymentMethod !== booking.payment_method) {
        const { data } = await bookingService.updatePaymentMethod({
          booking_id: booking.id,
          payment_method: selectedPaymentMethod,
        });
        setBooking(data as Booking);
      }

      const orderResponse = await paymentService.createOrder(booking.id);
      const orderId = orderResponse?.data?.order_id as string | undefined;
      const paymentKey = orderResponse?.data?.payment_key as string | undefined;

      if (!orderId || !paymentKey) {
        throw new Error("Unable to initialize secure payment.");
      }

      if (isUpiFlow) {
        const { txnRef, uri } = buildUpiUri(booking.id, totalAmount);
        setUpiSession({ orderId, txnRef, upiUri: uri });
        return;
      }

      if (selectedPaymentMethod === "cash") {
        const cashPaymentId = `cash_${booking.id}_${Date.now()}`;
        await paymentService.verifyPayment({
          booking_id: booking.id,
          payment_id: cashPaymentId,
          order_id: orderId,
          signature: "",
        });
        navigate("/payment/success", {
          replace: true,
          state: {
            bookingId: booking.id,
            serviceName: service?.title,
            transactionId: cashPaymentId,
            amount: totalAmount,
          },
        });
        return;
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
              Secure checkout is supported for Razorpay and UPI scanner-based payments.
            </div>
            {errorMessage && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

            {upiSession && isUpiFlow && (
              <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sky-700">
                  <QrCode className="h-4 w-4" />
                  <p className="text-sm font-semibold">Scan & Pay</p>
                </div>
                <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiSession.upiUri)}`}
                    alt="UPI QR Code"
                    className="h-56 w-56"
                  />
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  Use PhonePe, Google Pay, or any UPI app to scan this code and pay {currency(totalAmount)}.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <a
                    href={upiSession.upiUri}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    <Smartphone className="h-4 w-4" />
                    Open UPI App
                  </a>
                  <Button
                    onClick={handleUpiVerification}
                    disabled={verifyingUpi}
                    className="gap-2"
                  >
                    {verifyingUpi ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                    I Have Paid
                  </Button>
                </div>
              </div>
            )}

            {selectedPaymentMethod === "stripe" && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Card details</p>
                <p className="mt-1 text-xs text-slate-500">
                  Stripe checkout becomes available once the provider accepts the booking.
                </p>
                <div ref={stripeCardRef} className="mt-4 min-h-12 rounded-lg border border-slate-300 bg-white p-3" />
                {!stripeReady && (
                  <p className="mt-2 text-xs text-slate-500">Loading secure card fields...</p>
                )}
              </div>
            )}

            <Button className="mt-4 w-full gap-2" onClick={handlePayment} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {selectedPaymentMethod === "stripe" ? "Pay with Stripe" : isUpiFlow ? "Generate UPI QR" : "Pay Securely"}
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
