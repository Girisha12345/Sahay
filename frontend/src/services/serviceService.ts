import { api } from "./api";
import type { Category, ServiceItem } from "../types";

type RawService = Omit<ServiceItem, "category"> & {
  category: number | Category;
  category_name?: string;
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

const withNormalizedServiceList = (data: unknown): ServiceItem[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeService(item as RawService));
};

const withNormalizedServiceDetail = (data: unknown): ServiceItem => normalizeService(data as RawService);

export const serviceService = {
  getCategories: () => api.get("categories/"),
  getPublicServices: (params?: { category?: string | number; search?: string }) =>
    api.get("services/", { params }).then((response) => ({
      ...response,
      data: withNormalizedServiceList(response.data),
    })),
  getServiceDetail: (id: string | number) =>
    api.get(`services/${id}/`).then((response) => ({
      ...response,
      data: withNormalizedServiceDetail(response.data),
    })),

  // Backward-compatible aliases used by existing pages.
  categories: () => api.get("categories/"),
  services: (search?: string) =>
    api.get("services/", { params: search ? { search } : undefined }).then((response) => ({
      ...response,
      data: withNormalizedServiceList(response.data),
    })),
  serviceById: (id: string | number) =>
    api.get(`services/${id}/`).then((response) => ({
      ...response,
      data: withNormalizedServiceDetail(response.data),
    })),
};
