export const API_BASE_URL = "http://127.0.0.1:8000/api/";
export const WS_BASE_URL = "ws://127.0.0.1:8000";

export const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  "HOME SERVICES": { icon: "🏠", description: "Plumbing, electrical, carpentry and more" },
  "CLEANING SERVICES": { icon: "🧹", description: "Home and office deep cleaning" },
  "TECHNICAL SERVICES": { icon: "🛠️", description: "Device setup, repairs and IT support" },
  "DELIVERY & ERRANDS": { icon: "🚚", description: "Quick local deliveries and errands" },
  "PERSONAL CARE": { icon: "💆", description: "Wellness and personal care at home" },
  EDUCATION: { icon: "📚", description: "Tutors and skill training" },
  AUTOMOBILE: { icon: "🚗", description: "Vehicle repairs and roadside help" },
  FITNESS: { icon: "🏋️", description: "Coaches, yoga and fitness sessions" },
  "EVENT SERVICES": { icon: "🎉", description: "Decor, catering and event helpers" },
  "BEAUTY & SALON": { icon: "💄", description: "Salon and grooming professionals" },
  "PROFESSIONAL SERVICES": { icon: "💼", description: "Business and legal assistance" },
  "ODD JOBS": { icon: "🔧", description: "Small jobs done quickly" },
  "PET SERVICES": { icon: "🐾", description: "Pet grooming and care" },
  "FOOD SERVICES": { icon: "🍱", description: "Home chefs and meal prep" },
};
