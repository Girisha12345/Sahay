import { create } from "zustand";

import { bookingService } from "../services/bookingService";
import type { Booking } from "../types";

type BookingState = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchCustomerBookings: () => Promise<void>;
  fetchProviderBookings: () => Promise<void>;
};

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  loading: false,
  error: null,

  async fetchCustomerBookings() {
    set({ loading: true, error: null });
    try {
      const { data } = await bookingService.customerBookings();
      set({ bookings: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  async fetchProviderBookings() {
    set({ loading: true, error: null });
    try {
      const { data } = await bookingService.providerBookings();
      set({ bookings: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
}));
