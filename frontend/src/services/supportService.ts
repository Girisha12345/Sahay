import { api } from "./api";

export const supportService = {
  tickets: () => api.get("support/"),

  createTicket: (payload: {
    subject: string;
    description: string;
    booking?: number | null;
  }) => api.post("support/", payload),

  updateTicket: (id: number, data: { status: string }) =>
    api.patch(`support/tickets/${id}`, data),

  getChatAudit: (ticketId: number) =>
    api.get(`support/tickets/${ticketId}/chat/`),
};