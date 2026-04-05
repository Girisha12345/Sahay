import { api } from "./api";

export const providerService = {
  // Dashboard and Profile
  getDashboardStats: () => api.get("provider/dashboard/"),
  getProfile: () => api.get("provider/profile/"),
  updateProfile: (payload: {
    skills?: string[];
    experience_years?: number;
    hourly_rate?: number;
    documents?: string[];
    city?: string;
  }) => api.patch("provider/update-profile/", payload),

  // Earnings
  getEarnings: () => api.get("provider/earnings/"),
  getEarningsBreakdown: (params?: { status?: string; date_from?: string; date_to?: string }) =>
    api.get("provider/earnings/breakdown/", { params }),

  // Ratings and Reviews
  getProviderReviews: () => api.get("provider/reviews/"),
  getServiceReviews: (serviceId: number) => api.get("reviews/", { params: { service: serviceId } }),

  // Availability
  setAvailability: (payload: { is_available: boolean }) =>
    api.patch("provider/availability/", payload),
  getAvailability: () => api.get("provider/availability/"),

  // Work History
  getWorkHistory: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get("provider/work-history/", { params }),

  // Services Management
  getMyServices: () => api.get("provider/services/"),
  updateService: (serviceId: number, payload: { is_active?: boolean }) =>
    api.patch(`provider/services/${serviceId}/`, payload),

  // Monthly Statistics
  getMonthlyStats: () => api.get("provider/stats/monthly/"),
  getYearlyStats: () => api.get("provider/stats/yearly/"),

  // Acceptance Rate and Performance
  getPerformanceMetrics: () => api.get("provider/metrics/"),
};
