import { api } from "./api";

export const bookingService = {
  create: (payload: {
    provider?: string;
    service: number;
    scheduled_date: string;
    scheduled_time: string;
    total_price: number;
  }) => api.post("bookings/create", payload),
  customerBookings: () => api.get("bookings/customer"),
  providerBookings: () => api.get("bookings/provider"),
  updateStatus: (payload: { booking_id: number; status: string }) => api.patch("bookings/update-status", payload),
};
