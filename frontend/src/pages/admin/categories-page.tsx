import { useEffect } from "react";

import { CategoryCard } from "../../components/cards/category-card";
import { useServiceStore } from "../../store/serviceStore";
import { CATEGORY_META } from "../../utils/constants";

export function AdminCategoriesPage() {
  const { categories, fetchCategories } = useServiceStore();

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Service Categories</h1>
      <p className="mt-1 text-sm text-slate-500">Review and maintain service category taxonomy for the marketplace.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const meta = CATEGORY_META[category.name] || { description: "General services" };
          return <CategoryCard key={category.id} title={category.name} description={meta.description} />;
        })}
      </div>
    </div>
  );
}
