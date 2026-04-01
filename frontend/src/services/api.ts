import axios from "axios";

import { API_BASE_URL } from "../utils/constants";

const emitApiError = (message: string) => {
  window.dispatchEvent(new CustomEvent("api:error", { detail: { message } }));
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
    let message = error?.response?.data?.detail || "Something went wrong. Please try again.";

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
