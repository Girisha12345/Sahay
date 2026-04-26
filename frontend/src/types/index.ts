export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN" | "SUPPORT_AGENT";

export interface User {
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_verified_provider: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  base_price: string;
  is_active: boolean;
  category: Category;
  rating?: number;
  total_reviews?: number;
  average_rating?: number;
  review_count?: number;
  location?: string;
  availability?: string;
  image?: string;
}

export interface ServiceReview {
  id: number;
  service: number;
  user: string;
  user_name?: string;
  booking?: number | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Booking {
  id: number;
  customer: string;
  provider: string;
  provider_name?: string;
  provider_email?: string;
  service: number;
  status: "PENDING_PAYMENT" | "PENDING" | "CONFIRMED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REFUNDED" | "DISPUTED";
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  locality: string;
  pincode: string;
  notes?: string;
  payment_method: "upi" | "phonepe" | "googlepay" | "razorpay" | "cash";
  payment_status?: "INITIATED" | "PAID" | "RELEASED" | "FAILED" | "REFUNDED";
  has_review?: boolean;
  review_rating?: number | null;
  total_price: string;
  commission_amount: string;
  final_provider_amount: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender: string;
  sender_email?: string;
  content: string;
  created_at: string;
  is_flagged?: boolean;
}

export interface ChatMessage {
  id: number;
  sender_id: string;
  sender_role: "CUSTOMER" | "PROVIDER" | "SYSTEM";
  message_text: string;
  timestamp: string;
  blocked?: boolean;
  is_typing?: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type:
    | "BOOKING_CREATED"
    | "BOOKING_ACCEPTED"
    | "PAYMENT_SUCCESS"
    | "NEW_MESSAGE"
    | "BOOKING_COMPLETED"
    | "BOOKING_CANCELLED"
    | "REFUND_INITIATED";
  is_read: boolean;
  created_at: string;
  payload?: {
    booking_id?: number;
    [key: string]: unknown;
  };
}

export interface AddressItem {
  id: number;
  label: string;
  full_name: string;
  phone_number: string;
  address_line: string;
  area: string;
  city: string;
  pin_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketItem {
  id: number;
  subject: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
  booking?: number | null;
  created_at: string;
}

export type PaymentUiStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface PaymentHistoryItem {
  id: number;
  booking: number;
  amount: string;
  commission: string;
  payment_method: "upi" | "phonepe" | "googlepay" | "razorpay" | "cash";
  payment_status: "INITIATED" | "PAID" | "RELEASED" | "FAILED" | "REFUNDED";
  transaction_id: string;
  provider_released_at?: string | null;
  created_at: string;

  // Frontend-computed fields for UI rendering.
  serviceName: string;
  paymentId: string;
  uiStatus: PaymentUiStatus;
}

export interface ProviderProfile {
  id?: string;
  user?: string | User;
  skills: string[];
  experience_years: number;
  hourly_rate: number;
  documents: string[];
  verification_status: "PENDING" | "APPROVED" | "REJECTED";
  city: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderStats {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  in_progress_bookings: number;
  total_earnings: string;
  average_rating: number;
}

export interface ProviderBookingRequest {
  id: number;
  customer: string;
  customer_public?: {
    first_name: string;
    last_name: string;
    completed_jobs: number;
  };
  service: number;
  service_title?: string;
  service_description?: string;
  status: Booking["status"];
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  locality: string;
  pincode: string;
  notes?: string;
  payment_method: string;
  total_price: string;
  final_provider_amount: string;
  commission_amount: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderReviewItem {
  id: number;
  service: number;
  user: string;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProviderEarnings {
  id: number;
  booking: number;
  amount: string;
  provider_amount: string;
  status: "PENDING" | "RELEASED" | "PAID";
  release_date?: string;
  payment_date?: string;
  created_at: string;
}

export interface WalletTransaction {
  id: number;
  booking: number;
  tx_type: "CREDIT" | "DEBIT";
  amount: string;
  commission_deducted: string;
  description: string;
  created_at: string;
}

export interface ProviderWallet {
  total_earned: string;
  total_commission_deducted: string;
  pending_payout: string;
  updated_at: string;
  transactions: WalletTransaction[];
}

export interface WeeklyChartPoint {
  week: string;
  amount: number;
}

export interface TransactionRow {
  id: number;
  service: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
  tx_type: "CREDIT" | "DEBIT";
}

export interface WalletData {
  total_earned: number;
  monthly_earned: number;
  pending_payout: number;
  total_commission_deducted: number;
  weekly_chart: WeeklyChartPoint[];
  transactions: TransactionRow[];
}
