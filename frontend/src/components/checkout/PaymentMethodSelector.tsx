import { CreditCard, Smartphone, Zap, Banknote } from "lucide-react";
import type { Booking } from "../../types";

type PaymentOption = {
  id: Booking["payment_method"];
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Cards, Net Banking, Wallets, UPI",
    icon: <CreditCard className="h-6 w-6" />,
    badge: "Recommended",
  },
  {
    id: "upi",
    label: "UPI",
    description: "Google Pay, PhonePe, BHIM, PayTM",
    icon: <Smartphone className="h-6 w-6" />,
    badge: "Fast",
  },
  {
    id: "googlepay",
    label: "Google Pay",
    description: "Secure checkout via Google",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: "phonepe",
    label: "PhonePe",
    description: "Direct PhonePe payment",
    icon: <Smartphone className="h-6 w-6" />,
  },
  {
    id: "cash",
    label: "Pay on Service",
    description: "Pay to the service provider in cash",
    icon: <Banknote className="h-6 w-6" />,
  },
];

type PaymentMethodSelectorProps = {
  selectedMethod: Booking["payment_method"];
  onSelect: (method: Booking["payment_method"]) => void;
};

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Payment Method</h3>
      <div className="grid gap-3">
        {PAYMENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`relative rounded-xl border-2 p-4 text-left transition ${
              selectedMethod === option.id
                ? "border-sky-600 bg-sky-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 ${
                    selectedMethod === option.id ? "text-sky-600" : "text-slate-400"
                  }`}
                >
                  {option.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{option.label}</p>
                    {option.badge && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{option.description}</p>
                </div>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300">
                {selectedMethod === option.id && (
                  <div className="h-4 w-4 rounded-full bg-sky-600" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
