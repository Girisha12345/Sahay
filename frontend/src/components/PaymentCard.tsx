import { CalendarDays, CreditCard, ReceiptText, WalletCards } from "lucide-react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { currency } from "../utils/format";
import type { PaymentHistoryItem, PaymentUiStatus } from "../types";

const STATUS_STYLES: Record<PaymentUiStatus, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<PaymentUiStatus, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  googlepay: "Google Pay",
  phonepe: "PhonePe",
  razorpay: "Razorpay",
  cash: "Cash",
};

type PaymentCardProps = {
  payment: PaymentHistoryItem;
  onViewDetails: (payment: PaymentHistoryItem) => void;
  onDownloadInvoice: (payment: PaymentHistoryItem) => void;
};

const formatPaymentDate = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export function PaymentCard({ payment, onViewDetails, onDownloadInvoice }: PaymentCardProps) {
  return (
    <Card className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{payment.serviceName}</h3>
          <p className="mt-1 text-sm text-slate-500">Booking ID: #{payment.booking}</p>
          <p className="text-sm text-slate-500">Payment ID: {payment.paymentId}</p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[payment.uiStatus]}`}>
          {STATUS_LABELS[payment.uiStatus]}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{currency(payment.amount)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Date</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            {formatPaymentDate(payment.created_at)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Method</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
            <WalletCards className="h-4 w-4 text-slate-500" />
            {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
          <CreditCard className="h-3.5 w-3.5" />
          Status: {payment.payment_status}
        </span>
        {payment.transaction_id && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <ReceiptText className="h-3.5 w-3.5" />
            Ref: {payment.transaction_id}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => onDownloadInvoice(payment)}>
          Download Invoice
        </Button>
        <Button type="button" variant="secondary" onClick={() => onViewDetails(payment)}>
          View details
        </Button>
      </div>
    </Card>
  );
}
