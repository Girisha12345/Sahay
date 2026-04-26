import api from "../services/api";

export const providerApi = {
  bookings: () => api.get("bookings/provider/"),
  reviews: (providerId) => api.get(`reviews/provider/${providerId}/`),
  earnings: () => api.get("payments/history/"),
  updateBookingStatus: (bookingId, status) => api.patch("bookings/update-status/", { booking_id: bookingId, status }),
  services: () => api.get("services/"),
  createService: (payload) => api.post("services/", payload),
  updateService: (id, payload) => api.patch(`services/${id}`, payload),
  deleteService: (id) => api.delete(`services/${id}`),
  chatByBooking: (bookingId) => api.get(`bookings/${bookingId}/chat/`),
  sendChat: (payload) => api.post("chat/send/", payload),
};
