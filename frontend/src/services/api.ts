import axios from "axios";

import { API_BASE_URL } from "../utils/constants";

const emitApiError = (message: string) => {
  window.dispatchEvent(new CustomEvent("api:error", { detail: { message } }));
};

const extractApiErrorMessage = (data: unknown): string | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Record<string, unknown>;

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (Array.isArray(payload.non_field_errors) && typeof payload.non_field_errors[0] === "string") {
    return payload.non_field_errors[0];
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }

  return null;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    let message = extractApiErrorMessage(error?.response?.data) || "Something went wrong. Please try again.";

    if (!error?.response) {
      message = "Network error. Please check your internet connection.";
    } else if (status === 401) {
      message = "Unauthorized. Please login again.";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else if (status >= 500) {
      message = "Server error. Please try again shortly.";
    }

    emitApiError(message);
    return Promise.reject(new Error(message));
  },
);

  export default api;
