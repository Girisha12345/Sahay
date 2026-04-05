import { api } from "./api";

export type ProfileUpdatePayload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
};

export const profileService = {
  getProfile: () => api.get("auth/profile/"),
  updateProfile: (payload: ProfileUpdatePayload) => api.patch("auth/profile/update/", payload),
};