import { api } from "./api";

export type AdminRevenueAnalytics = {
  totals: {
    revenue: number | string | null;
    commission: number | string | null;
    provider_earnings: number | string | null;
  };
  payment_status: Array<{
    payment_status: string;
    total: number;
  }>;
  completed_bookings: number;
  flagged_messages: number;
};

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
  getPendingProviders: () => api.get<PendingProvider[]>("admin/providers/pending/"),
  approveProvider: (providerId: number) => api.patch("admin/providers/approve/", { provider_id: providerId }),
  rejectProvider: (providerId: number) => api.patch("admin/providers/reject/", { provider_id: providerId }),
  getFlaggedChats: () => api.get<FlaggedChatRecord[]>("admin/flagged-chats/"),
};
