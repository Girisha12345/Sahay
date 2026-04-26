import { Check } from "lucide-react";

type Step = {
  id: number;
  label: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between py-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm transition ${
              currentStep >= step.id
                ? "bg-sky-600 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {currentStep > step.id ? (
              <Check className="h-5 w-5" />
            ) : (
              step.id
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              currentStep >= step.id ? "text-slate-900" : "text-slate-500"
            }`}>
              {step.label}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-4 flex-1 h-1 ${
              currentStep > step.id ? "bg-sky-600" : "bg-slate-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
