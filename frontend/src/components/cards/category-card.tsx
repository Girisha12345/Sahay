import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Car,
  Dumbbell,
  GraduationCap,
  HeartHandshake,
  Home,
  Laptop,
  PawPrint,
  PartyPopper,
  Scissors,
  Sparkles,
  Truck,
  Utensils,
  Wrench,
} from "lucide-react";

import { Card } from "../ui/card";

const DEFAULT_ICON = Wrench;

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "HOME SERVICES": Home,
  "CLEANING SERVICES": Sparkles,
  "TECHNICAL SERVICES": Laptop,
  "DELIVERY & ERRANDS": Truck,
  "PERSONAL CARE": HeartHandshake,
  EDUCATION: GraduationCap,
  AUTOMOBILE: Car,
  FITNESS: Dumbbell,
  "EVENT SERVICES": PartyPopper,
  "BEAUTY & SALON": Scissors,
  "PROFESSIONAL SERVICES": Briefcase,
  "ODD JOBS": Wrench,
  "PET SERVICES": PawPrint,
  "FOOD SERVICES": Utensils,
};

export function CategoryCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick?: () => void;
}) {
  const Icon = CATEGORY_ICON_MAP[title] || DEFAULT_ICON;

  return (
    <Card className="flex h-full flex-col gap-4 rounded-xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-blue-600">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {onClick && (
        <button
          type="button"
          className="mt-auto inline-flex h-10 items-center justify-center rounded-lg border border-sky-200 px-4 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
          onClick={onClick}
        >
          View Services
        </button>
      )}
    </Card>
  );
}
