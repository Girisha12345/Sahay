import { CheckCircle2, TicketCheck } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

type PaymentSuccessState = {
  bookingId?: number;
  serviceName?: string;
  transactionId?: string;
  amount?: number;
};

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as PaymentSuccessState;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/customer/bookings", { replace: true });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-12">
      <Card className="w-full rounded-2xl border p-8 text-center shadow-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Payment Successful</h1>
        <p className="mt-2 text-sm text-slate-500">Booking Confirmed</p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Booking ID</p>
            <p className="mt-1 font-semibold text-slate-900">#{state.bookingId ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Service</p>
            <p className="mt-1 font-semibold text-slate-900">{state.serviceName ?? "Service Booking"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Transaction ID</p>
            <p className="mt-1 font-semibold text-slate-900 break-all">{state.transactionId ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Amount Paid</p>
            <p className="mt-1 font-semibold text-slate-900">₹{state.amount ? state.amount.toFixed(2) : "0.00"}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => navigate("/customer/bookings", { replace: true })} className="gap-2">
            <TicketCheck className="h-4 w-4" />
            View Bookings
          </Button>
          <Button variant="secondary" onClick={() => navigate("/customer/dashboard", { replace: true })}>
            Go to Dashboard
          </Button>
        </div>

        <p className="mt-5 text-xs text-slate-500">Redirecting to bookings automatically...</p>
      </Card>
    </div>
  );
}
