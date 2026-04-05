import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CategoryCard } from "../../components/cards/category-card";
import { HowItWorks } from "../../components/home/HowItWorks";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useAuthStore } from "../../store/authStore";
import { useServiceStore } from "../../store/serviceStore";
import { CATEGORY_META } from "../../utils/constants";

export function HomePage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const { user } = useAuthStore();
  const { categories } = useServiceStore();
  const topCategories = useMemo(() => categories.slice(0, 6), [categories]);

  const firstName = user?.first_name || "Guest";

  const handleSearch = () => {
    const query = searchText.trim();
    if (!query) return;
    navigate(`/services?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-14">
      <section className="grid gap-6 rounded-3xl bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-500 p-8 text-white md:grid-cols-2 md:p-12">
        <div>
          <p className="text-sm uppercase tracking-wide text-sky-100">Welcome to Sahāy</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">Hello, <span className="text-sky-100">{firstName}!</span></h1>
          <p className="mt-4 text-sm text-sky-50">Book verified local experts in minutes. Get reliable service delivered to your doorstep.</p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => navigate("/services")}>Explore Services</Button>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate("/customer/dashboard")}>View My Bookings</Button>
          </div>
        </div>
        <Card className="bg-white/95 text-slate-900">
          <h3 className="text-lg font-bold">Search services</h3>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Try plumber, tutor, cleaner..."
                className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <Button type="submit" className="shrink-0">
              Search
            </Button>
          </form>
          <p className="mt-2 text-xs text-slate-500">✓ Fast booking  ✓ Transparent price  ✓ In-app chat</p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">Popular Service Categories</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topCategories.map((category) => {
            const meta = CATEGORY_META[category.name] || { description: "On-demand local services" };
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
      </section>

      <HowItWorks />
    </div>
  );
}
