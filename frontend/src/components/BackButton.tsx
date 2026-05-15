import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  /**
   * Optional fallback route if no history is available
   * @example "/provider/dashboard" or "/services"
   */
  fallback?: string;
  
  /**
   * Optional custom label for the button
   * @example "Back to Services" or "Back to Dashboard"
   */
  label?: string;
}

export function BackButton({ fallback, label = "Back" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Try to navigate back in history
    // If there's no history, navigate to fallback route (if provided)
    // Otherwise, just attempt -1 which should be handled by browser
    if (fallback) {
      // Check if we can go back by using a sentinel approach
      // For now, just try -1 and rely on fallback if needed
      const currentPath = window.location.pathname;
      navigate(-1);
      
      // Simple check: if we're still on the same path after a short delay,
      // navigate to fallback instead
      setTimeout(() => {
        if (window.location.pathname === currentPath) {
          navigate(fallback);
        }
      }, 100);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      type="button"
      className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
      aria-label={`Go back to previous page or ${fallback ? 'to ' + fallback : ''}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
