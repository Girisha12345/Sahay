import { BriefcaseBusiness, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useAuthStore } from "../../store/authStore";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-slate-900">
          <BriefcaseBusiness className="h-6 w-6 text-sky-600" /> Sahāy
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-semibold text-slate-600 md:flex">
          <Link className="hover:text-sky-600" to="/">Home</Link>
          <Link className="hover:text-sky-600" to="/categories">Categories</Link>
          <Link className="hover:text-sky-600" to="/services">Services</Link>
        </nav>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
              <Button onClick={() => navigate("/register")}>Sign Up</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate(user.role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard")}>
                <UserCircle2 className="mr-1 h-4 w-4" /> Profile
              </Button>
              <Button variant="secondary" onClick={() => void logout()}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
