import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { useAuthStore } from "../../store/authStore";
import { getDashboardPathForRole } from "../../utils/routes";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, isAuthenticated, accessToken } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Redirect to home if already logged in (Flipkart-style)
  if (isAuthenticated && accessToken) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      await useAuthStore.getState().loadProfile();

      const currentUser = useAuthStore.getState().user;
      const nextPath = searchParams.get("next");
      if (currentUser?.role === "PROVIDER") {
        const key = `provider_onboarding_done_${localStorage.getItem("accessToken") || "default"}`;
        const completed = localStorage.getItem(key) === "true";
        navigate(completed ? "/provider/dashboard" : "/provider/onboarding", { replace: true });
        return;
      }

      if (currentUser?.role === "CUSTOMER" && nextPath) {
        navigate(nextPath, { replace: true });
        return;
      }

      navigate(getDashboardPathForRole(currentUser?.role), { replace: true });
    } catch (err) {
      // Error is handled by the store and displayed in the form
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome to Sahāy</h1>
          <p className="mt-2 text-sm text-slate-500">Login to your account to book trusted local services</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <Input 
              placeholder="your@email.com" 
              {...register("email")}
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10"
                {...register("password")}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <Button 
            className="w-full py-3 font-semibold" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner /> Logging in...
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        
        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-600">
            Don't have an account? <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">Sign up here</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
