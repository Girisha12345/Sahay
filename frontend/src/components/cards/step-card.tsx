import { useNavigate } from "react-router-dom";

import { Card } from "../ui/card";

type StepCardProps = {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  route: string;
};

export function StepCard({ stepNumber, title, description, icon, route }: StepCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer rounded-xl border border-slate-200 p-6 transition duration-300 hover:shadow-xl"
      onClick={() => navigate(route)}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Step {stepNumber}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </Card>
  );
}