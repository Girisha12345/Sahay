import { api } from "./api";

export interface AdminRevenueAnalytics {
  total_revenue: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  pending_bookings: number;
  monthly_revenue: Array<{ month: string; revenue: number }>;
}

export type PendingProvider = {
  id: number;
  user?:
    | {
        id?: string;
        email?: string;
        first_name?: string;
        last_name?: string;
      }
    | string;
  skills?: string[];
  experience_years?: number;
  hourly_rate?: number;
  documents?: string[];
  verification_status?: string;
  city?: string;
  rating?: number;
};

export type FlaggedChatRecord = {
  id: number;
  booking_id: number | null;
  sender_email: string;
  raw_content: string;
  status?: "PENDING" | "RESOLVED" | "DISMISSED";
  flagged_at: string;
};

export interface DashboardStats {
  total_revenue: number;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  pending_bookings: number;
  active_providers: number;
  active_customers: number;
  monthly_growth_percent: number;
}

export interface RevenueAnalytics {
  daily_trend: Array<{ date: string; revenue: number }>;
  weekly_trend: Array<{ week: string; revenue: number }>;
  monthly_trend: Array<{ month: string; revenue: number }>;
  yearly_trend: Array<{ year: string; revenue: number }>;
  category_breakdown: Array<{ name: string; value: number }>;
  comparison: {
    monthly: Array<{ name: string; revenue: number }>;
    yearly: Array<{ name: string; revenue: number }>;
  };
}

export interface BookingAnalytics {
  status_distribution: Array<{ name: string; value: number }>;
  daily_trend: Array<{ date: string; bookings: number }>;
  weekly_trend: Array<{ week: string; bookings: number }>;
  monthly_trend: Array<{ month: string; bookings: number }>;
}

export interface ProviderAnalyticsRecord {
  name: string;
  email: string;
  services: string[];
  rating: number;
  completed_jobs: number;
  revenue: number;
}

export interface CustomerAnalytics {
  growth_trend: Array<{
    date: string;
    new_registrations: number;
    active_customers: number;
    returning_customers: number;
  }>;
  top_customers: Array<{
    name: string;
    email: string;
    total_bookings: number;
    total_spend: number;
  }>;
}

export interface PaymentAnalytics {
  methods_share: Array<{ name: string; value: number }>;
  status_trends: Array<{ name: string; count: number }>;
}

export interface ChatAnalyticsRecord {
  date: string;
  flagged: number;
  resolved: number;
  pending: number;
}

export interface ServiceCategoryAnalyticsRecord {
  name: string;
  bookings: number;
}

export const adminService = {
  getRevenueAnalytics: () => api.get<AdminRevenueAnalytics>("admin/revenue/"),

  getPendingProviders: () => api.get<PendingProvider[]>("admin/providers/pending"),

  approveProvider: (providerId: string | number) =>
    api.patch("admin/providers/approve", { provider_id: providerId }),

  rejectProvider: (providerId: string | number) =>
    api.patch("admin/providers/reject/", { provider_id: providerId }),

  getFlaggedChats: () => api.get<FlaggedChatRecord[]>("admin/flagged-chats"),

  getCategories: () => api.get("categories/"),

  createCategory: (name: string) => api.post("categories/", { name, is_active: true }),

  updateCategory: (id: number, data: { name?: string; is_active?: boolean }) =>
    api.patch(`categories/${id}/`, data),

  deleteCategory: (id: number) => api.delete(`categories/${id}/`),

  getDashboardStats: (params?: Record<string, string>) =>
    api.get<DashboardStats>("admin/dashboard-stats", { params }),

  getRevenueAnalyticsData: (params?: Record<string, string>) =>
    api.get<RevenueAnalytics>("admin/revenue-analytics", { params }),

  getBookingAnalytics: (params?: Record<string, string>) =>
    api.get<BookingAnalytics>("admin/booking-analytics", { params }),

  getProviderAnalytics: (params?: Record<string, string>) =>
    api.get<ProviderAnalyticsRecord[]>("admin/provider-analytics", { params }),

  getCustomerAnalytics: (params?: Record<string, string>) =>
    api.get<CustomerAnalytics>("admin/customer-analytics", { params }),

  getPaymentAnalytics: (params?: Record<string, string>) =>
    api.get<PaymentAnalytics>("admin/payment-analytics", { params }),

  getChatAnalytics: (params?: Record<string, string>) =>
    api.get<ChatAnalyticsRecord[]>("admin/chat-moderation-analytics", { params }),

  getServiceAnalytics: (params?: Record<string, string>) =>
    api.get<ServiceCategoryAnalyticsRecord[]>("admin/service-analytics", { params }),

  resolveFlaggedChat: (id: number, action: "resolve" | "dismiss") =>
    api.patch(`admin/flagged-chats/${id}/resolve`, { action }),

  getReportDownloadUrl: (reportType: string, format: string, params?: Record<string, string>) => {
    const query = new URLSearchParams({ report_type: reportType, format, ...params }).toString();
    // Default base URL fallback
    const baseUrl = api.defaults.baseURL || "http://localhost:8000/api/";
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return `${normalizedBaseUrl}admin/reports/download?${query}`;
  },
};
