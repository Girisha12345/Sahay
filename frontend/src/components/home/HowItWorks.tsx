import { CheckCircle2, ClipboardList, MessageCircleMore } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "../ui/card";

const steps = [
  {
    step: "Step 1",
    title: "Post Your Need",
    description: "Browse service categories and choose the service you need from verified local professionals.",
    icon: ClipboardList,
    path: "/categories",
  },
  {
    step: "Step 2",
    title: "Chat and Confirm",
    description:
      "Use in-app chat to discuss service details securely without sharing personal contact information.",
    icon: MessageCircleMore,
    path: "/customer/chat",
  },
  {
    step: "Step 3",
    title: "Get It Done",
    description: "Track booking status, pay securely, and get your work completed by trusted experts.",
    icon: CheckCircle2,
    path: "/customer/dashboard",
  },
] as const;

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">How It Works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Book Trusted Services in 3 Easy Steps
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Simple, fast and secure service booking experience.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.step}
                onClick={() => navigate(step.path)}
                className="h-full cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{step.step}</p>
                      <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}