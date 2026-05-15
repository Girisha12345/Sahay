import { api } from "./api";

export const reviewService = {
  list: (serviceId: number) =>
    api.get("reviews/", { params: { service: serviceId } }),

  providerReviews: () => api.get("reviews/provider/"),

  create: (payload: {
    service?: number;
    booking?: number;
    rating: number;
    comment?: string;
  }) => api.post("reviews/create/", payload),
};
