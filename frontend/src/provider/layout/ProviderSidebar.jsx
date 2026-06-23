import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BriefcaseBusiness,
  PlusCircle,
  Wallet,
  MessageCircle,
  Clock3,
  Star,
  UserCircle2,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Bookings", to: "/provider/bookings", icon: CalendarDays },
  { label: "My Services", to: "/provider/services", icon: BriefcaseBusiness },
  { label: "Add Service", to: "/provider/add-service", icon: PlusCircle },
  { label: "Earnings", to: "/provider/earnings", icon: Wallet },
  { label: "Messages", to: "/provider/messages", icon: MessageCircle },
  { label: "Availability", to: "/provider/availability", icon: Clock3 },
  { label: "Reviews", to: "/provider/reviews", icon: Star },
  { label: "Profile", to: "/provider/profile", icon: UserCircle2 },
  { label: "Payments", to: "/provider/payments", icon: CreditCard },
  { label: "Settings", to: "/provider/settings", icon: Settings },
];

export function ProviderSidebar({ onLogout }) {
  const [onboarding, setOnboarding] = useState({ onboarding_step: 1, onboarding_completed: false });

  useEffect(() => {
    let mounted = true;
    import("../../services/providerService").then((mod) => {
      mod.providerService
        .getOnboarding()
        .then(({ data }) => {
          if (!mounted) return;
          setOnboarding({ onboarding_step: data.onboarding_step || 1, onboarding_completed: Boolean(data.onboarding_completed) });
        })
        .catch(() => {});
    });
    return () => {
      mounted = false;
    };
  }, []);

  const percent = Math.round(((onboarding.onboarding_step || 1) / 6) * 100);
  return (
    <aside className="relative h-full w-72 border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Sahay Provider</p>
          <p className="text-xs text-slate-500">Worker Console</p>
        </div>
      </div>

      <nav className="h-[calc(100%-8.75rem)] space-y-1 overflow-y-auto px-3 py-4">
        {menu.map((item) => (
          <div key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>

            {/* Insert onboarding CTA directly under Payments */}
            {item.to === "/provider/payments" && (
              <div className="mt-2 px-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Complete your profile</div>
                      <div className="text-sm text-slate-500">Get more bookings</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700 font-semibold">{percent}%</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link to="/provider/onboarding" className="inline-block rounded-md bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-700">
                      Complete profile
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 w-full border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
