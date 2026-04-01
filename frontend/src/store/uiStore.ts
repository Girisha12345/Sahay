import { create } from "zustand";

type UiState = {
  apiError: string | null;
  setApiError: (message: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  apiError: null,
  setApiError: (message) => set({ apiError: message }),
}));
