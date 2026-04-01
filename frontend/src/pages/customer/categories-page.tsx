import { useNavigate } from "react-router-dom";

import { CategoryCard } from "../../components/cards/category-card";
import { EmptyState } from "../../components/ui/empty-state";
import { useServiceStore } from "../../store/serviceStore";
import { CATEGORY_META } from "../../utils/constants";

export function CategoriesPage() {
  const navigate = useNavigate();
  const { categories } = useServiceStore();

  if (!categories.length) {
    return <EmptyState title="No categories available" subtitle="Please check back in a moment." />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Service Categories</h1>
      <p className="mt-1 text-sm text-slate-500">Pick a category to discover services near you.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const meta = CATEGORY_META[category.name] || { icon: "🛎️", description: "On-demand local service" };
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
    </div>
  );
}
