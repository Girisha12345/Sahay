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
  flagged_at: string;
};

export const adminService = {
  getRevenueAnalytics: () => api.get<AdminRevenueAnalytics>("admin/revenue/"),

  getPendingProviders: () => api.get("admin/providers/pending"),

  approveProvider: (providerId: string | number) =>
    api.patch("admin/providers/approve", { provider_id: providerId }),

  rejectProvider: (providerId: string | number) =>
    api.patch("admin/providers/reject/", { provider_id: providerId }),

  getFlaggedChats: () => api.get("admin/flagged-chats"),

  getCategories: () => api.get("categories/"),

  createCategory: (name: string) => api.post("categories/", { name, is_active: true }),

  updateCategory: (id: number, data: { name?: string; is_active?: boolean }) =>
    api.patch(`categories/${id}/`, data),

  deleteCategory: (id: number) => api.delete(`categories/${id}/`),
};
