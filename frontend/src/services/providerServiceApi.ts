import { api } from "./api";
import type { Category, ServiceItem } from "../types";

type RawService = Omit<ServiceItem, "category"> & {
  category: number | Category;
  category_name?: string;
};

export type ProviderServicePayload = {
  title: string;
  description: string;
  category: number;
  base_price: number;
  duration_minutes: number;
  location: string;
  is_active?: boolean;
};

const normalizeCategory = (service: RawService): Category => {
  if (typeof service.category === "object" && service.category) {
    return service.category;
  }
  return {
    id: Number(service.category || 0),
    name: service.category_name || "",
    is_active: true,
  };
};

const normalizeService = (service: RawService): ServiceItem => ({
  ...service,
  category: normalizeCategory(service),
});

export const providerServiceApi = {
  listMyServices: () =>
    api.get("services/my/").then((response) => ({
      ...response,
      data: Array.isArray(response.data) ? response.data.map((item) => normalizeService(item as RawService)) : [],
    })),
  createMyService: (payload: ProviderServicePayload) =>
    api.post("services/my/", payload).then((response) => ({
      ...response,
      data: normalizeService(response.data as RawService),
    })),
  updateMyService: (id: number, payload: Partial<ProviderServicePayload>) =>
    api.patch(`services/my/${id}/`, payload).then((response) => ({
      ...response,
      data: normalizeService(response.data as RawService),
    })),
  deleteMyService: (id: number) => api.delete(`services/my/${id}/`),
  toggleMyService: (id: number) =>
    api.post(`services/my/${id}/toggle/`, {}).then((response) => ({
      ...response,
      data: normalizeService(response.data as RawService),
    })),

  getMyServices: () =>
    api.get("services/my/").then((response) => ({
      ...response,
      data: Array.isArray(response.data) ? response.data.map((item) => normalizeService(item as RawService)) : [],
    })),
  createService: (payload: ProviderServicePayload) =>
    api.post("services/my/", payload).then((response) => ({
      ...response,
      data: normalizeService(response.data as RawService),
    })),
  deleteService: (id: number) => api.delete(`services/my/${id}/`),
  toggleService: (id: number) =>
    api.post(`services/my/${id}/toggle/`, {}).then((response) => ({
      ...response,
      data: normalizeService(response.data as RawService),
    })),
};
