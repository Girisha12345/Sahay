import { api } from "./api";

export type AddressPayload = {
  label: string;
  full_name: string;
  phone_number: string;
  address_line: string;
  area?: string;
  city: string;
  pin_code: string;
  is_default?: boolean;
};

export const addressService = {
  list: () => api.get("addresses/"),
  create: (payload: AddressPayload) => api.post("addresses/", payload),
  update: (id: number, payload: AddressPayload) => api.patch(`addresses/${id}/`, payload),
  remove: (id: number) => api.delete(`addresses/${id}/`),
};