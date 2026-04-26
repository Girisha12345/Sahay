import axios from "axios";

import { API_BASE_URL, API_TIMEOUT_MS, API_WITH_CREDENTIALS } from "../config/apiConfig";

const emitApiError = (message: string | null) => {
  window.dispatchEvent(new CustomEvent("api:error", { detail: { message } }));
};

const extractApiErrorMessage = (data: unknown): string | null => {
  if (typeof data === "string" && data.trim().length > 0) {
    return data.trim();
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Record<string, unknown>;

  if (typeof payload.error === "string" && payload.error.trim().length > 0) {
    return payload.error;
  }

  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message;
  }

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
  timeout: API_TIMEOUT_MS,
  withCredentials: API_WITH_CREDENTIALS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    emitApiError(null);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const code = error?.code as string | undefined;
    const backendMessage = extractApiErrorMessage(error?.response?.data);
    let message = backendMessage || "Something went wrong. Please try again.";

    if (!error?.response) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        message = "You appear to be offline. Please check your internet connection.";
      } else if (code === "ECONNABORTED") {
        message = "Request timed out. Please try again.";
      } else {
        message = "Unable to reach the API server. Ensure backend is running and VITE_API_BASE_URL/Vite proxy is correct.";
      }
    } else if (status === 401) {
      message = "Unauthorized. Please login again.";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else if (status === 403) {
      message = "Access denied. You do not have permission to perform this action.";
    } else if (status === 404) {
      message = "API endpoint not found. Verify the backend route and base URL.";
    } else if (status >= 500) {
      // Keep backend-provided detail in development to make debugging login issues easier.
      message = backendMessage || "Server error. Please try again shortly.";
    }

    emitApiError(message);

    const normalizedError = Object.assign(new Error(message), {
      status,
      code,
      data: error?.response?.data,
    });

    return Promise.reject(normalizedError);
  },
);

export default api;
