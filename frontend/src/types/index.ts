export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN" | "SUPPORT_AGENT";

export interface User {
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_verified_provider: boolean;
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
  location?: string;
  availability?: string;
}

export interface Booking {
  id: number;
  customer: string;
  provider: string;
  service: number;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISPUTED";
  scheduled_date: string;
  scheduled_time: string;
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
