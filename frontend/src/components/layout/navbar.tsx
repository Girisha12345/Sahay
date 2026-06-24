import { BriefcaseBusiness, UserCircle2, Menu, X, Home, Layers, CreditCard, LayoutDashboard, User, LogIn, LogOut, UserPlus, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Button } from "../ui/button";
import { NotificationBell } from "../NotificationBell";
import { useAuthStore } from "../../store/authStore";
import { getDashboardPathForRole } from "../../utils/routes";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardPath = user ? getDashboardPathForRole(user.role) : "/login";

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-xl font-black text-slate-900">
            <BriefcaseBusiness className="h-6 w-6 text-sky-600" /> Sahay-Local Service Market Place
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-semibold text-slate-600 md:flex">
            <Link className="hover:text-sky-600" to="/">Home</Link>
            <Link className="hover:text-sky-600" to="/categories">Service Categories</Link>
            <Link className="hover:text-sky-600" to="/services">Services</Link>
            <Link className="hover:text-sky-600" to="/payments">Payments</Link>
          </nav>
          
          {/* Desktop Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
                <Button variant="ghost" onClick={() => navigate(dashboardPath)}>Dashboard</Button>
                <Button onClick={() => navigate("/register")}>Sign Up</Button>
              </>
            ) : (
              <>
                <NotificationBell />
                <Button variant="ghost" onClick={() => navigate(dashboardPath)}>Dashboard</Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate(
                      user.role === "PROVIDER"
                        ? "/provider/profile"
                        : user.role === "SUPPORT_AGENT"
                          ? "/support/dashboard"
                          : user.role === "ADMIN"
                            ? "/admin/dashboard"
                            : "/customer/profile",
                    )
                  }
                >
                  <UserCircle2 className="mr-1 h-4 w-4" /> Profile
                </Button>
                <Button variant="secondary" onClick={() => void handleLogout()}>Logout</Button>
              </>
            )}
          </div>

          {/* Mobile Menu & Bell Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 shadow-sm transition"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Slide-out from right) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer content (fixed right) */}
          <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white p-6 shadow-xl flex flex-col gap-6 md:hidden transition-transform duration-300 ease-out transform translate-x-0 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-xl font-black text-slate-900">
                <BriefcaseBusiness className="h-6 w-6 text-sky-600" /> Sahay-Local Service Market Place
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile / Greeting Section */}
            {user ? (
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-700">
                  {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="font-bold text-slate-900 truncate max-w-[170px]">{user.first_name} {user.last_name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{user.role}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                  G
                </div>
                <div>
                  <p className="font-bold text-slate-900">Hello, Guest!</p>
                  <p className="text-xs text-slate-500">Welcome to Sahāy</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1 font-semibold text-slate-600">
              <Link
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                to="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <Home className="h-4.5 w-4.5 text-slate-400" />
                  Home
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
              
              <Link
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <Layers className="h-4.5 w-4.5 text-slate-400" />
                  Service Categories
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>

              <Link
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <BriefcaseBusiness className="h-4.5 w-4.5 text-slate-400" />
                  Services
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>

              <Link
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                to="/payments"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                  Payments
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            </nav>
            
            {/* User Action List */}
            <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-slate-100">
              {!user ? (
                <>
                  <Link
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <LogIn className="h-4.5 w-4.5 text-slate-400" />
                      Login
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                  <Link
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="h-4.5 w-4.5 text-slate-400" />
                      Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                  <Button
                    className="mt-4 w-full py-2.5 rounded-xl font-bold justify-center"
                    onClick={() => handleNavigation("/register")}
                  >
                    <UserPlus className="mr-2 h-4.5 w-4.5" />
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="h-4.5 w-4.5 text-slate-400" />
                      Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                  <Link
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-sky-600 transition-colors font-semibold text-sm"
                    to={
                      user.role === "PROVIDER"
                        ? "/provider/profile"
                        : user.role === "SUPPORT_AGENT"
                          ? "/support/dashboard"
                          : user.role === "ADMIN"
                            ? "/admin/dashboard"
                            : "/customer/profile"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-3">
                      <User className="h-4.5 w-4.5 text-slate-400" />
                      Profile
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                  <button
                    onClick={() => void handleLogout()}
                    className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors font-semibold text-sm text-left mt-2"
                  >
                    <span className="flex items-center gap-3">
                      <LogOut className="h-4.5 w-4.5 text-red-400" />
                      Logout
                    </span>
                    <ChevronRight className="h-4 w-4 text-red-300" />
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
