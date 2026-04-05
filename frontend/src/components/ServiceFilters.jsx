import { MapPin, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
  "Electrician",
  "Plumber",
  "Cleaning",
  "Carpenter",
  "AC Repair",
  "Painting",
  "Salon",
  "Appliance Repair",
];

const RATING_OPTIONS = [
  { label: "All ratings", value: "0" },
  { label: "⭐ 4+ rating", value: "4" },
  { label: "⭐ 3+ rating", value: "3" },
  { label: "⭐ 2+ rating", value: "2" },
];

const AVAILABILITY_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Available today", value: "today" },
  { label: "Available tomorrow", value: "tomorrow" },
  { label: "Available this week", value: "week" },
];

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  price: 10000,
  rating: 0,
  location: "",
  availability: "",
};

export function ServiceFilters({ onFiltersChange, initialSearch = "" }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(10000);
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    onFiltersChange({ search, category, price, rating, location, availability });
  }, [search, category, price, rating, location, availability, onFiltersChange]);

  const handleReset = () => {
    setSearch("");
    setCategory(DEFAULT_FILTERS.category);
    setPrice(DEFAULT_FILTERS.price);
    setRating(DEFAULT_FILTERS.rating);
    setLocation(DEFAULT_FILTERS.location);
    setAvailability(DEFAULT_FILTERS.availability);
  };

  return (
    <div className="mt-4 rounded-xl bg-white p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for services (Electrician, Plumber...)"
            className="h-11 w-full border border-slate-200 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 min-w-[170px] border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Category</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="min-w-[210px] flex-1">
          <p className="mb-1 text-xs font-medium text-slate-500">Price range</p>
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="mt-1 text-sm font-semibold text-slate-700">
            ₹0 - ₹{price.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="relative min-w-[145px]">
          <Star className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
          <select
            value={String(rating)}
            onChange={(event) => setRating(Number(event.target.value))}
            className="h-11 w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[180px]">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Enter city"
            className="h-11 w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
          className="h-11 min-w-[190px] border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleReset}
          className="h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
