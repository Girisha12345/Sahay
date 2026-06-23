"use client";

import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-soft transition hover:-translate-y-1 hover:bg-sky-700"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}