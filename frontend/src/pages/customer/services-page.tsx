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

const EMPTY_FILTERS: ServiceFilterValues = {
  search: "",
  category: "",
  price: 10000,
  rating: 0,
  location: "",
  availability: "",
}

function getCategoryName(service: ServiceItem) {
  if (service.category_name) return service.category_name;
  if (typeof service.category === "object" && service.category?.name) return service.category.name;
  return "";
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
        const queryCategory = filters.category || categoryParam || undefined;
        const querySearch = (filters.search || searchQuery || "").trim() || undefined;
        const { data } = await serviceService.getPublicServices({
          category: queryCategory,
          search: querySearch,
        });
        setServices(Array.isArray(data) ? data : []);
      } finally {
        setPageLoading(false);
      }
    };

    void fetchServices();
  }, [categoryParam, searchQuery, filters.category, filters.search]);

  const handleFiltersChange = useCallback((nextFilters: ServiceFilterValues) => {
    setFilters(nextFilters);
  }, []);

  const filtered = useMemo(
    () =>
      services.filter((service) => {
        const activeSearch = (filters.search || searchQuery).trim().toLowerCase();
        const normalizedLocation = filters.location.trim().toLowerCase();
        const normalizedAvailability = filters.availability.trim().toLowerCase();

        const priceMatch = Number(service.base_price) <= filters.price;
        const effectiveRating = Number(service.average_rating ?? service.rating ?? 0);
        const ratingMatch = effectiveRating >= filters.rating;

        const categoryName = getCategoryName(service);
        const searchHaystack = `${service.title} ${service.description} ${categoryName}`.toLowerCase();
        const searchMatch = activeSearch ? searchHaystack.includes(activeSearch) : true;

        const locationHaystack = `${service.location || ""} ${service.description} ${categoryName}`.toLowerCase();
        const locationMatch = normalizedLocation ? locationHaystack.includes(normalizedLocation) : true;

        const availabilityValue = (service.availability || "").toLowerCase();
        const availabilityMatch = normalizedAvailability
          ? (availabilityValue ? availabilityValue.includes(normalizedAvailability) : true)
          : true;

        return priceMatch && ratingMatch && searchMatch && locationMatch && availabilityMatch;
      }),
    [services, filters, searchQuery],
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
            <ServiceCard
              key={service.id}
              service={service}
              onBook={(serviceId) => {
                const selectedService = filtered.find((item) => item.id === serviceId);
                navigate(`/checkout?serviceId=${serviceId}`, {
                  state: selectedService ? { service: selectedService } : undefined,
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
