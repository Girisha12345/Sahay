import { Star } from "lucide-react";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { currency } from "../../utils/format";
import type { ServiceItem } from "../../types";

export function ServiceCard({ service, onBook }: { service: ServiceItem; onBook: (serviceId: number) => void }) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{service.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900">{currency(service.base_price)}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            <Star className="h-3 w-3" /> {service.rating ?? 4.6}
          </span>
        </div>
      </div>
      <Button className="mt-4 w-full" onClick={() => onBook(service.id)}>
        Book Now
      </Button>
    </Card>
  );
}
