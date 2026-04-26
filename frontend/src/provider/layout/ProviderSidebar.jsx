import { NavLink } from "react-router-dom";
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
          <NavLink
            key={item.to}
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
