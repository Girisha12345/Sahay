import api from "./api";

export type PaymentMethod = "upi" | "phonepe" | "googlepay" | "razorpay" | "cash";

export const paymentService = {
  createIntent: (bookingId: number) => api.post("payments/create-intent/", { booking_id: bookingId }),
  getHistory: () => api.get("payments/history/"),
  getWallet: () => api.get("payments/wallet/"),
  processRefund: (bookingId: number, refundType: "full" | "partial", amount?: number) =>
    api.post("payments/refund/", {
      booking_id: bookingId,
      refund_type: refundType,
      amount,
    }),

  createOrder: (payload: { booking_id: number; amount: number }) =>
    api.post("payments/create-order/", payload),
  createStripeIntent: (payload: { booking_id: number }) =>
    api.post("payments/stripe-intent/", payload),
  verifyPayment: (payload: {
    booking_id: number;
    payment_id: string;
    order_id: string;
    signature?: string;
  }) => api.post("payments/verify/", payload),
  history: async () => {
    try {
      return await api.get("payments/");
    } catch {
      return api.get("payments/history/");
    }
  },
};
