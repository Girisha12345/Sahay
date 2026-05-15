import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation component
 * Displays page hierarchy and allows navigation to parent pages
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: "Dashboard", path: "/provider/dashboard" },
 *     { label: "My Services", path: "/provider/services" },
 *     { label: "Add Service", path: "/provider/add-service", isCurrent: true },
 *   ]}
 * />
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.path}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}

            {item.isCurrent || isLast ? (
              <span className="text-slate-900 font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-sky-600 hover:text-sky-700 hover:underline transition"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
