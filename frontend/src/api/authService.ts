import { api } from "../services/api";

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
  register: (payload: RegisterPayload) => api.post("/auth/register/", payload),
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post("/auth/login/", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const access = response.data?.access;
    const refresh = response.data?.refresh;

    if (!access || !refresh) {
      throw new Error("Login succeeded but token response was invalid.");
    }

    saveTokens(access, refresh);
    return response;
  },
  changePassword: (payload: { current_password: string; new_password: string; confirm_password: string }) =>
    api.post("/auth/change-password/", payload),
  logout: async (refresh: string) => {
    const response = await api.post("/auth/logout/", { refresh });
    clearTokens();
    return response;
  },
  deactivateAccount: async (refresh?: string | null) => {
    const response = await api.post("/auth/deactivate-account/", refresh ? { refresh } : {});
    clearTokens();
    return response;
  },
  getProfile: () => api.get("/auth/profile/"),
  getProviderDashboard: () => api.get("/provider/dashboard"),
  updateProviderProfile: (payload: {
    full_name?: string;
    phone_number?: string;
    skills?: string[];
    experience_years?: number;
    hourly_rate?: number;
    documents?: string[];
    certificates?: string[];
    service_areas?: string[];
    languages_known?: string[];
  }) => api.put("/providers/profile/update/", payload),
  clearTokens,
};
