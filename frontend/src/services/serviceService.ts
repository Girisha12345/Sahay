import { api } from "./api";

export const serviceService = {
  categories: () => api.get("categories"),
  services: (search?: string) =>
    api.get("services/", {
      params: search ? { search } : undefined,
    }),
  serviceById: (id: string | number) => api.get(`services/${id}`),
};
