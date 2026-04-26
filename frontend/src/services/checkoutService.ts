import apiClient from "./api";
import type { Booking, AddressItem } from "../types";

export interface CheckoutData {
  service_id: string;
  address_id: string;
  payment_method: Booking["payment_method"];
  scheduled_date: string;
  scheduled_time: string;
  notes?: string;
  booking_type: "scheduled" | "instant";
}

export interface CheckoutSession {
  id: string;
  booking_id: string;
  total_amount: number;
  payment_method: string;
  status: "pending" | "completed" | "cancelled";
}

class CheckoutService {
  /**
   * Create a new booking for checkout
   */
  async createBooking(
    data: Omit<CheckoutData, "payment_method">
  ): Promise<Booking> {
    const response = await apiClient.post<Booking>("/bookings/", {
      service_id: data.service_id,
      address_id: data.address_id,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      notes: data.notes,
      booking_type: data.booking_type,
      payment_method: "pending", // Set initially, updated after payment
    });
    return response.data;
  }

  /**
   * Update booking payment method
   */
  async updatePaymentMethod(
    bookingId: string,
    paymentMethod: Booking["payment_method"]
  ): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/bookings/${bookingId}/`, {
      payment_method: paymentMethod,
    });
    return response.data;
  }

  /**
   * Create payment order for Razorpay
   */
  async createPaymentOrder(bookingId: string): Promise<{ order_id: string; amount: number }> {
    const response = await apiClient.post("/payments/create-order/", {
      booking_id: bookingId,
    });
    return response.data;
  }

  /**
   * Verify Razorpay payment
   */
  async verifyPayment(data: {
    order_id: string;
    payment_id: string;
    signature: string;
    booking_id: string;
  }): Promise<{ success: boolean; booking: Booking }> {
    const response = await apiClient.post("/payments/verify-payment/", data);
    return response.data;
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.get<Booking>(`/bookings/${bookingId}/`);
    return response.data;
  }

  /**
   * Fetch user addresses
   */
  async fetchAddresses(): Promise<AddressItem[]> {
    const response = await apiClient.get<AddressItem[]>("/addresses/");
    return response.data;
  }

  /**
   * Create new address
   */
  async createAddress(
    data: Omit<AddressItem, "id" | "created_at" | "updated_at">
  ): Promise<AddressItem> {
    const response = await apiClient.post<AddressItem>("/addresses/", data);
    return response.data;
  }

  /**
   * Update existing address
   */
  async updateAddress(
    addressId: string,
    data: Partial<Omit<AddressItem, "id" | "created_at" | "updated_at">>
  ): Promise<AddressItem> {
    const response = await apiClient.patch<AddressItem>(
      `/addresses/${addressId}/`,
      data
    );
    return response.data;
  }
}

export default new CheckoutService();
