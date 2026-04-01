import { api } from "./api";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: "CUSTOMER" | "PROVIDER";
}

const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const authService = {
  register: (payload: RegisterPayload) => api.post("auth/register", payload),
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post("auth/login", payload);
    saveTokens(response.data.access, response.data.refresh);
    return response;
  },
  logout: async (refresh: string) => {
    const response = await api.post("auth/logout", { refresh });
    clearTokens();
    return response;
  },
  getProfile: () => api.get("auth/profile"),
  clearTokens,
};
