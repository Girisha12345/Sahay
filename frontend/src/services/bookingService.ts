import { api } from "./api";

export const bookingService = {
  create: (payload: {
    service_id: number;
    service_date: string;
    service_time: string;
    full_name: string;
    phone: string;
    address_line: string;
    area?: string;
    city?: string;
    address: string;
    locality: string;
    pincode: string;
    notes?: string;
    payment_method: "upi" | "phonepe" | "googlepay" | "razorpay" | "cash";
    total_price: number;
  }) =>
    api.post("bookings/create/", {
      service_id: payload.service_id,
      service_date: payload.service_date,
      service_time: payload.service_time,
      full_name: payload.full_name,
      phone: payload.phone,
      address_line: payload.address_line,
      area: payload.area || "",
      city: payload.city || "",
      address: payload.address,
      locality: payload.locality,
      pincode: payload.pincode,
      notes: payload.notes || "",
      payment_method: payload.payment_method,
      total_price: payload.total_price,
    }),
  customerBookings: () => api.get("bookings/customer/"),
  providerBookings: () => api.get("bookings/provider/"),
  updateStatus: (payload: { booking_id: number; status: string }) => api.patch("bookings/update-status/", payload),
  updatePaymentMethod: (payload: { booking_id: number; payment_method: "upi" | "phonepe" | "googlepay" | "razorpay" | "cash" }) =>
    api.patch("bookings/update-payment-method/", payload),
  getById: (bookingId: number) => api.get(`bookings/${bookingId}/`),
  acceptBooking: (bookingId: number) => api.patch(`bookings/update-status/`, { booking_id: bookingId, status: "ACCEPTED" }),
  startWork: (bookingId: number) => api.patch(`bookings/update-status/`, { booking_id: bookingId, status: "IN_PROGRESS" }),
  completeBooking: (bookingId: number) => api.patch(`bookings/update-status/`, { booking_id: bookingId, status: "COMPLETED" }),
  rejectBooking: (bookingId: number) => api.patch(`bookings/update-status/`, { booking_id: bookingId, status: "CANCELLED" }),
};
