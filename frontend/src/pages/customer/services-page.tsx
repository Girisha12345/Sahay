import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { ServiceFilters } from "../../components/ServiceFilters";
import { ServiceCard } from "../../components/cards/service-card";
import { Button } from "../../components/ui/button";
import { EmptyState } from "../../components/ui/empty-state";
import { Spinner } from "../../components/ui/spinner";
import { serviceService } from "../../services/serviceService";
import type { ServiceItem } from "../../types";
import { useServiceStore } from "../../store/serviceStore";

type ServiceFilterValues = {
  search: string;
  category: string;
  price: number;
  rating: number;
  location: string;
  availability: string;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Electrician: ["electric", "wiring", "switch", "fan", "light"],
  Plumber: ["plumb", "pipe", "tap", "sink", "bathroom", "water"],
  Cleaning: ["clean", "sanit", "wash", "hygiene"],
  Carpenter: ["carpent", "furniture", "wood", "door", "window", "shelf"],
  "AC Repair": ["ac", "air", "cooling", "conditioner"],
  Painting: ["paint", "wall", "color"],
  Salon: ["salon", "beauty", "hair", "facial", "makeup", "groom"],
  "Appliance Repair": ["appliance", "repair", "refrigerator", "washing", "laptop", "printer", "tv", "mobile"],
};

const EMPTY_FILTERS: ServiceFilterValues = {
  search: "",
  category: "",
  price: 10000,
  rating: 0,
  location: "",
  availability: "",
};

function matchesCategoryFilter(service: ServiceItem, selectedCategory: string) {
  if (!selectedCategory) return true;

  const normalizedSelected = selectedCategory.trim().toLowerCase();
  const keywords = CATEGORY_KEYWORDS[selectedCategory] || [];
  const searchable = `${service.title} ${service.description} ${service.category.name}`.toLowerCase();

  // Fallback to direct match to avoid false "no services" when a keyword map entry is missing.
  if (searchable.includes(normalizedSelected)) {
    return true;
  }

  return keywords.length ? keywords.some((keyword) => searchable.includes(keyword)) : true;
}

function resolveCategoryMatch(service: ServiceItem, categoryParam: string) {
  if (!categoryParam) return true;

  const normalizedParam = categoryParam.trim().toLowerCase();
  const serviceCategoryId = String(service.category?.id ?? "").toLowerCase();
  const serviceCategoryName = String(service.category?.name ?? "").trim().toLowerCase();

  return serviceCategoryId === normalizedParam || serviceCategoryName === normalizedParam;
}

export function ServicesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loading } = useServiceStore();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceFilterValues>(EMPTY_FILTERS);

  const categoryParam = (searchParams.get("category") || "").trim();
  const searchQuery = (searchParams.get("search") || "").trim();

  useEffect(() => {
    const fetchServices = async () => {
      setPageLoading(true);
      try {
        const { data } = await serviceService.services();
        setServices(data);
      } finally {
        setPageLoading(false);
      }
    };

    void fetchServices();
  }, []);

  const handleFiltersChange = useCallback((nextFilters: ServiceFilterValues) => {
    setFilters(nextFilters);
  }, []);

  const filtered = useMemo(
    () =>
      services.filter((service) => {
        const activeSearch = (filters.search || searchQuery).trim().toLowerCase();
        const normalizedLocation = filters.location.trim().toLowerCase();
        const normalizedAvailability = filters.availability.trim().toLowerCase();

        const categoryMatch = resolveCategoryMatch(service, categoryParam);
        const categoryDropdownMatch = matchesCategoryFilter(service, filters.category);
        const priceMatch = Number(service.base_price) <= filters.price;
        const effectiveRating = Number(service.average_rating ?? service.rating ?? 0);
        const ratingMatch = effectiveRating >= filters.rating;

        const searchHaystack = `${service.title} ${service.description} ${service.category.name}`.toLowerCase();
        const searchMatch = activeSearch ? searchHaystack.includes(activeSearch) : true;

        const locationHaystack = `${service.location || ""} ${service.description} ${service.category.name}`.toLowerCase();
        const locationMatch = normalizedLocation ? locationHaystack.includes(normalizedLocation) : true;

        const availabilityValue = (service.availability || "").toLowerCase();
        const availabilityMatch = normalizedAvailability
          ? (availabilityValue ? availabilityValue.includes(normalizedAvailability) : true)
          : true;

        return categoryMatch && categoryDropdownMatch && priceMatch && ratingMatch && searchMatch && locationMatch && availabilityMatch;
      }),
    [services, categoryParam, filters, searchQuery],
  );

  const handleBrowseAll = () => {
    navigate("/services");
  };

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold">Services</h1>
      <ServiceFilters initialSearch={searchQuery} onFiltersChange={handleFiltersChange} />

      {loading || pageLoading ? (
        <div className="mt-6 flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : !filtered.length ? (
        <div className="mt-6">
          <EmptyState
            title="No matching services found"
            subtitle={searchQuery || filters.search ? "Try a different keyword or browse all services." : "Try changing your filters."}
          />
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={handleBrowseAll}>
              Browse all services
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} onBook={(serviceId) => navigate(`/booking/${serviceId}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
