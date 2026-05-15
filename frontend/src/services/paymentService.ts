import api from "./api";

export const paymentService = {
  createIntent: (bookingId: number) =>
    api.post("payments/create-intent/", { booking_id: bookingId }),

  createOrder: (bookingId: number) =>
    api.post("payments/create-order/", { booking_id: bookingId }),

  createStripeIntent: (payload: { booking_id: number }) =>
    api.post("payments/stripe-intent/", payload),

  verify: (payload: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    booking_id: number;
  }) => api.post("payments/verify/", payload),

  verifyPayment: (payload: {
    booking_id: number;
    payment_id: string;
    order_id: string;
    signature?: string;
  }) => api.post("payments/verify/", payload),

  history: () => api.get("payments/history/"),

  getWallet: () => api.get("payments/wallet/"),

  processRefund: (
    bookingId: number,
    refundType: "full" | "partial" = "full",
    amount?: number
  ) =>
    api.post("payments/refund/", {
      booking_id: bookingId,
      refund_type: refundType,
      amount,
    }),
};
