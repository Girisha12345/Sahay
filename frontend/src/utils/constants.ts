const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const wsUrl = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();

export const API_BASE_URL = apiUrl && apiUrl.length > 0 ? apiUrl : "http://127.0.0.1:8000/api/";
export const WS_BASE_URL = wsUrl && wsUrl.length > 0 ? wsUrl : "ws://127.0.0.1:8000";

export const CATEGORY_META: Record<string, { description: string }> = {
  "HOME SERVICES": { description: "Plumbing, electrical, carpentry and more" },
  "CLEANING SERVICES": { description: "Home and office deep cleaning" },
  "TECHNICAL SERVICES": { description: "Device setup, repairs and IT support" },
  "DELIVERY & ERRANDS": { description: "Quick local deliveries and errands" },
  "PERSONAL CARE": { description: "Wellness and personal care at home" },
  EDUCATION: { description: "Tutors and skill training" },
  AUTOMOBILE: { description: "Vehicle repairs and roadside help" },
  FITNESS: { description: "Coaches, yoga and fitness sessions" },
  "EVENT SERVICES": { description: "Decor, catering and event helpers" },
  "BEAUTY & SALON": { description: "Salon and grooming professionals" },
  "PROFESSIONAL SERVICES": { description: "Business and legal assistance" },
  "ODD JOBS": { description: "Small jobs done quickly" },
  "PET SERVICES": { description: "Pet grooming and care" },
  "FOOD SERVICES": { description: "Home chefs and meal prep" },
};
