import { Bell, Menu } from "lucide-react";

export function ProviderNavbar({ title, subtitle, onMenuClick, rightContent }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightContent}
          <button type="button" className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
