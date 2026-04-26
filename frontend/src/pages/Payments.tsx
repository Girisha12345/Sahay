import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

import { BackButton } from "../components/BackButton";
import { PaymentCard } from "../components/PaymentCard";
import { EmptyState } from "../components/ui/empty-state";
import { Spinner } from "../components/ui/spinner";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { serviceService } from "../services/serviceService";
import type { Booking, PaymentHistoryItem, PaymentUiStatus, ServiceItem } from "../types";

type DateFilter = "7" | "30" | "180";
type StatusFilter = "ALL" | PaymentUiStatus;

const mapPaymentToUiStatus = (status: string): PaymentUiStatus => {
  if (status === "PAID" || status === "RELEASED") return "COMPLETED";
  if (status === "INITIATED") return "PENDING";
  return "FAILED";
};

const getDateThreshold = (days: DateFilter) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - Number(days));
  return threshold;
};

const formatInvoiceDate = (dateValue: string) => {
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

const methodLabel = (method: string) => {
  const map: Record<string, string> = {
    upi: "UPI",
    googlepay: "Google Pay",
    phonepe: "PhonePe",
    razorpay: "Razorpay",
    cash: "Cash",
  };

  return map[method] || method.toUpperCase();
};

export function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Payment History | Sahay";
    return () => {
      document.title = "Sahay Service Marketplace";
    };
  }, []);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);

      try {
        const [paymentsResponse, servicesResponse, bookingsResponse] = await Promise.all([
          paymentService.history(),
          serviceService.services(),
          bookingService.customerBookings().catch(() => ({ data: [] as Booking[] })),
        ]);

        const services = servicesResponse.data as ServiceItem[];
        const serviceNameById = new Map<number, string>(services.map((item) => [item.id, item.title]));

        const bookings = bookingsResponse.data as Booking[];
        const bookingById = new Map<number, Booking>(bookings.map((item) => [item.id, item]));

        const normalizedPayments = (paymentsResponse.data as PaymentHistoryItem[]).map((payment) => {
          const matchedBooking = bookingById.get(payment.booking);
          const serviceName = matchedBooking ? serviceNameById.get(matchedBooking.service) : null;

          return {
            ...payment,
            serviceName: serviceName || `Service Booking #${payment.booking}`,
            paymentId: payment.transaction_id || `PAY_${payment.id}`,
            uiStatus: mapPaymentToUiStatus(payment.payment_status),
          };
        });

        setPayments(normalizedPayments);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchPaymentHistory();
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const dateThreshold = getDateThreshold(dateFilter);

    return payments.filter((payment) => {
      const matchesSearch = normalizedSearch
        ? payment.serviceName.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesStatus = statusFilter === "ALL" ? true : payment.uiStatus === statusFilter;

      const paymentDate = new Date(payment.created_at);
      const matchesDate = Number.isNaN(paymentDate.getTime()) ? true : paymentDate >= dateThreshold;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, search, statusFilter, dateFilter]);

  const handleDownloadInvoice = (payment: PaymentHistoryItem) => {
    const generatedOn = formatInvoiceDate(new Date().toISOString());
    const paidOn = formatInvoiceDate(payment.created_at);
    const amount = Number(payment.amount || 0);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 48;
    let y = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Sahay", left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("Service Marketplace", left, y + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("Invoice", 520, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Invoice ID: INV-${payment.id}`, 520, y + 16, { align: "right" });
    doc.text(`Generated on: ${generatedOn}`, 520, y + 30, { align: "right" });

    y = 120;
    doc.setDrawColor(226, 232, 240);
    doc.line(left, y, 547, y);
    y += 28;

    const row = (label: string, value: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(label, left, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(value, 547, y, { align: "right" });
      y += 24;
    };

    row("Service", payment.serviceName);
    row("Booking ID", `#${payment.booking}`);
    row("Payment ID", payment.paymentId);
    row("Payment Method", methodLabel(payment.payment_method));
    row("Payment Status", payment.uiStatus);
    row("Paid On", paidOn);

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(left, y, 547, y);
    y += 30;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(left, y, 499, 94, 8, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Description", left + 16, y + 24);
    doc.text("Amount", 531, y + 24, { align: "right" });

    doc.setDrawColor(226, 232, 240);
    doc.line(left + 16, y + 34, 531, y + 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(payment.serviceName, left + 16, y + 54);
    doc.text(`INR ${amount.toFixed(2)}`, 531, y + 54, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total", left + 16, y + 78);
    doc.text(`INR ${amount.toFixed(2)}`, 531, y + 78, { align: "right" });

    y += 124;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("This is a system-generated invoice from Sahay.", left, y);

    doc.save(`invoice-${payment.paymentId}.pdf`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <BackButton />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Payment History</h1>
        <p className="mt-1 text-sm text-slate-500">Track your past transactions and invoices.</p>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by service name"
              className="h-11 w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="ALL">All</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="180">Last 6 months</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No payment history yet."
          subtitle="Start booking services to see transactions here."
        />
      ) : (
        <div className="grid gap-4">
          {filteredPayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onDownloadInvoice={handleDownloadInvoice}
              onViewDetails={(selectedPayment) => navigate(`/customer/bookings/${selectedPayment.booking}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
