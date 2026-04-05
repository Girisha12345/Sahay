import { api } from "./api";

export type PaymentMethod = "upi" | "phonepe" | "googlepay" | "razorpay" | "cash";

export const paymentService = {
  createOrder: (payload: { booking_id: number; amount: number }) =>
    api.post("payments/create-order/", payload),
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
