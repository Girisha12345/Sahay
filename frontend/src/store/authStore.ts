import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authService } from "../services/authService";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    role: "CUSTOMER" | "PROVIDER";
  }) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
      isAuthenticated: Boolean(localStorage.getItem("accessToken")),
      loading: false,
      error: null,

      async login(email, password) {
        set({ loading: true, error: null });
        try {
          const { data } = await authService.login({ email, password });
          set({
            accessToken: data.access,
            refreshToken: data.refresh,
            user: data.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ loading: false, error: (error as Error).message });
          throw error;
        }
      },

      async register(payload) {
        set({ loading: true, error: null });
        try {
          await authService.register(payload);
          set({ loading: false });
        } catch (error) {
          set({ loading: false, error: (error as Error).message });
          throw error;
        }
      },

      async loadProfile() {
        if (!get().accessToken) return;
        try {
          const { data } = await authService.getProfile();
          set({ user: data, isAuthenticated: true });
        } catch {
          authService.clearTokens();
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        }
      },

      async logout() {
        const refresh = get().refreshToken;
        if (refresh) {
          try {
            await authService.logout(refresh);
          } catch {
            authService.clearTokens();
          }
        } else {
          authService.clearTokens();
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "sahay-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
