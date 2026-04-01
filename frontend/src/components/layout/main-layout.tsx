import { useEffect } from "react";
import type { PropsWithChildren } from "react";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { useUiStore } from "../../store/uiStore";

export function MainLayout({ children }: PropsWithChildren) {
  const { apiError, setApiError } = useUiStore();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      setApiError(customEvent.detail?.message || "Unexpected API error");
    };
    window.addEventListener("api:error", handler);
    return () => window.removeEventListener("api:error", handler);
  }, [setApiError]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      {apiError && (
        <div className="mx-auto mt-4 max-w-7xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center justify-between gap-3">
            <span>{apiError}</span>
            <button className="font-semibold" onClick={() => setApiError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
