import { api } from "./api";

export const serviceService = {
  categories: () => api.get("categories"),
  services: () => api.get("services"),
  serviceById: (id: string | number) => api.get(`services/${id}`),
};
