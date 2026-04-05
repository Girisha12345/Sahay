import { api } from "./api";

export const supportService = {
  tickets: () => api.get("support/"),
  createTicket: (payload: { subject: string; description: string; booking?: number | null }) =>
    api.post("support/", payload),
};