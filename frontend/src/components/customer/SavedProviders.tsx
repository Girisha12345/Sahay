import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Star, MapPin, Heart } from "lucide-react";

export interface SavedProvider {
  id: string;
  name: string;
  service: string;
  rating: number;
  completedJobs: number;
  city: string;
  hourlyRate?: string;
  isFavorite?: boolean;
}

interface SavedProviderCardProps {
  provider: SavedProvider;
  onBook: (providerId: string) => void;
  onToggleFavorite?: (providerId: string) => void;
}

export function SavedProviderCard({
  provider,
  onBook,
  onToggleFavorite,
}: SavedProviderCardProps) {
  return (
    <Card className="flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{provider.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{provider.service}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-slate-900">{provider.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-500">({provider.completedJobs} jobs)</span>
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
            <MapPin className="h-3 w-3" />
            {provider.city}
          </div>
        </div>

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(provider.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Heart className={`h-5 w-5 ${provider.isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
          </button>
        )}
      </div>

      {provider.hourlyRate && (
        <div className="border-t border-slate-200 pt-2">
          <p className="text-xs text-slate-600">Hourly Rate</p>
          <p className="font-semibold text-slate-900">₹{provider.hourlyRate}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        onClick={() => onBook(provider.id)}
        className="w-full"
      >
        Book Now
      </Button>
    </Card>
  );
}

interface SavedProvidersProps {
  providers: SavedProvider[];
  onBook: (providerId: string) => void;
  onToggleFavorite?: (providerId: string) => void;
  isLoading?: boolean;
}

export function SavedProviders({
  providers,
  onBook,
  onToggleFavorite,
  isLoading = false,
}: SavedProvidersProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <Card className="py-8 text-center">
        <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No saved providers yet</p>
        <p className="text-xs text-slate-500 mt-1">Book a service to save providers for quick re-booking</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {providers.map((provider) => (
        <SavedProviderCard
          key={provider.id}
          provider={provider}
          onBook={onBook}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
