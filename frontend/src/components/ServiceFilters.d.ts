export type ServiceFilterValues = {
  search: string;
  category: string;
  price: number;
  rating: number;
  location: string;
  availability: string;
};

export function ServiceFilters(props: {
  onFiltersChange: (filters: ServiceFilterValues) => void;
  initialSearch?: string;
}): JSX.Element;
