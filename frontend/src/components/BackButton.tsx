import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      type="button"
      className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </button>
  );
}
