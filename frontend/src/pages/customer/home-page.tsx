import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { CategoryCard } from "../../components/cards/category-card";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useServiceStore } from "../../store/serviceStore";
import { CATEGORY_META } from "../../utils/constants";

export function HomePage() {
  const navigate = useNavigate();
  const { categories } = useServiceStore();
  const topCategories = useMemo(() => categories.slice(0, 6), [categories]);

  return (
    <div className="space-y-14">
      <section className="grid gap-6 rounded-3xl bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 p-8 text-white md:grid-cols-2 md:p-12">
        <div>
          <p className="text-sm uppercase tracking-wide text-sky-100">Trusted Marketplace</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">Book verified local experts in minutes.</h1>
          <p className="mt-4 text-sm text-sky-50">Sahāy connects customers with vetted providers across home, tech, beauty, and more.</p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/services")}>Explore Services</Button>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate("/register")}>Become a Provider</Button>
          </div>
        </div>
        <Card className="bg-white/95 text-slate-900">
          <h3 className="text-lg font-bold">Search services</h3>
          <input
            placeholder="Try plumber, tutor, cleaner..."
            className="mt-3 h-11 w-full rounded-xl border border-slate-300 px-3"
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/services");
            }}
          />
          <p className="mt-2 text-xs text-slate-500">Fast booking. Transparent pricing. In-app chat.</p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Popular categories</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topCategories.map((category) => {
            const meta = CATEGORY_META[category.name] || { icon: "🛎️", description: "On-demand local services" };
            return (
              <CategoryCard
                key={category.id}
                icon={meta.icon}
                title={category.name}
                description={meta.description}
                onClick={() => navigate(`/services?category=${category.id}`)}
              />
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {["Post your need", "Chat and confirm", "Get it done"].map((step, index) => (
          <Card key={step}>
            <p className="text-sm font-semibold text-sky-700">Step {index + 1}</p>
            <h3 className="mt-2 text-lg font-bold">{step}</h3>
          </Card>
        ))}
      </section>
    </div>
  );
}
