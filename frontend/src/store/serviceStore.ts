import { create } from "zustand";

import { serviceService } from "../services/serviceService";
import type { Category, ServiceItem } from "../types";

type ServiceState = {
  categories: Category[];
  services: ServiceItem[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchServices: () => Promise<void>;
};

export const useServiceStore = create<ServiceState>((set) => ({
  categories: [],
  services: [],
  loading: false,
  error: null,

  async fetchCategories() {
    set({ loading: true, error: null });
    try {
      const { data } = await serviceService.categories();
      set({ categories: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  async fetchServices() {
    set({ loading: true, error: null });
    try {
      const { data } = await serviceService.services();
      set({ services: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },
}));
