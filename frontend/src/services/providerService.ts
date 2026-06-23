import { api } from "./api";

export const providerService = {
  // Dashboard and Profile
  getDashboardStats: () => api.get("provider/dashboard/"),
  getProfile: () => api.get("provider/profile/"),
  getOnboarding: () => api.get("provider/onboarding/"),
  saveOnboarding: (payload: {
    full_name?: string;
    phone_number?: string;
    skills?: string[];
    experience_years?: number;
    city?: string;
    certificates?: string[];
    identity_documents?: string[];
    bank_details?: Record<string, string>;
    service_areas?: string[];
    languages_known?: string[];
    onboarding_step?: number;
    submit?: boolean;
  }) => api.patch("provider/onboarding/", payload),
  uploadOnboardingFiles: (files: File[], documentType: "certificates" | "identity") => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("document_type", documentType);
    return api.post("provider/upload-document/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateProfile: (payload: {
    full_name?: string;
    phone_number?: string;
    skills?: string[];
    experience_years?: number;
    hourly_rate?: number;
    documents?: string[];
    city?: string;
    certificates?: string[];
    identity_documents?: string[];
    bank_details?: Record<string, string>;
    service_areas?: string[];
    languages_known?: string[];
  }) => api.put("providers/profile/update/", payload),

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
