import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export function SiteHeader() {
  const nav = [
    ["Home", "/"],
    ["Service Categories", "/service-categories"],
    ["Services", "/services"],
    ["Payments", "/payments"],
    ["About Us", "/about-us"],
    ["Contact", "/contact-us"],
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-slate-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600/10 text-sky-700">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          Sahāy
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-sky-700">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}