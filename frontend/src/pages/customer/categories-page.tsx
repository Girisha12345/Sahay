import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { CategoryCard } from "../../components/cards/category-card";
import { EmptyState } from "../../components/ui/empty-state";
import { useServiceStore } from "../../store/serviceStore";
import { CATEGORY_META } from "../../utils/constants";

export function CategoriesPage() {
  const navigate = useNavigate();
  const { categories, loading, error, fetchCategories } = useServiceStore();

  useEffect(() => {
    document.title = "Service Categories | Sahay";
    return () => {
      document.title = "Sahay Service Marketplace";
    };
  }, []);

  useEffect(() => {
    if (!categories.length) {
      void fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  if (loading && !categories.length) {
    return <EmptyState title="Loading service categories..." subtitle="Please wait while we fetch available services." />;
  }

  if (error && !categories.length) {
    return <EmptyState title="Unable to load service categories" subtitle={error} />;
  }

  if (!categories.length) {
    return <EmptyState title="No service categories available" subtitle="Please check back in a moment." />;
  }

  return (
    <div>
      <BackButton />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Pick a service category to discover professionals near you.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/services")}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-200 px-4 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          Skip to Services
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const meta = CATEGORY_META[category.name] || { description: "On-demand local service" };
          return (
            <CategoryCard
              key={category.id}
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
