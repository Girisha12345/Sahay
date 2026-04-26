import { Card } from "../ui/card";
import { currency } from "../../utils/format";
import type { ServiceItem, Booking } from "../../types";

type OrderSummaryProps = {
  service: ServiceItem | null;
  booking: Booking | null;
  label?: string;
};

export function OrderSummary({ service, booking, label = "Order Summary" }: OrderSummaryProps) {
  const basePrice = booking ? Number(booking.total_price) : (service ? Number(service.base_price) : 0);
  const commission = booking ? Number(booking.commission_amount) : Math.round(basePrice * 0.10);
  const totalPrice = booking ? Number(booking.total_price) : basePrice;

  return (
    <Card className="sticky top-20 rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{label}</h3>

      {service && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-slate-900">{service.title}</p>
          {service.category && (
            <p className="text-xs text-slate-500">{service.category.name}</p>
          )}
        </div>
      )}

      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Service Price</span>
          <span className="font-medium text-slate-900">{currency(basePrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Platform Fee</span>
          <span className="font-medium text-slate-900">{currency(commission)}</span>
        </div>
        {booking?.notes && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">Notes</p>
            <p className="text-sm text-slate-700">{booking.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="flex justify-between">
          <span className="font-semibold text-slate-900">Total Amount</span>
          <span className="text-xl font-bold text-sky-600">{currency(totalPrice)}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">GST included (if applicable)</p>
      </div>
    </Card>
  );
}
