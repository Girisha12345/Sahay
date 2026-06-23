import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="font-medium text-slate-600 hover:text-sky-700">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-semibold text-slate-900" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
          </span>
        );
      })}
    </nav>
  );
}