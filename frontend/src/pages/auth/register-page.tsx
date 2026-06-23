import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { useAuthStore } from "../../store/authStore";
import { getDashboardPathForRole } from "../../utils/routes";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone_number: z.string().min(10, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, login, loading, error } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "CUSTOMER" },
  });

  const onSubmit = async (values: FormValues) => {
    const parts = values.name.trim().split(/\s+/);
    await registerUser({
      first_name: parts[0],
      last_name: parts.slice(1).join(" ") || "User",
      email: values.email,
      phone_number: values.phone_number,
      password: values.password,
      role: values.role,
    });

    await login(values.email, values.password);
    await useAuthStore.getState().loadProfile();

    const currentUser = useAuthStore.getState().user;
    if (currentUser?.role === "PROVIDER") {
      const key = `provider_onboarding_done_${localStorage.getItem("accessToken") || "default"}`;
      localStorage.removeItem(key);
      navigate("/provider/onboarding", { replace: true });
      return;
    }

    navigate(getDashboardPathForRole(currentUser?.role), { replace: true });
  };

  return (
    <div className="mx-auto mt-8 max-w-lg">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join as a customer, provider, or administrator.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <Input placeholder="Full name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="md:col-span-2">
            <Input placeholder="Email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Input placeholder="Phone number" {...register("phone_number")} />
            {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number.message}</p>}
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div className="md:col-span-2">
            <select
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              {...register("role")}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <p className="md:col-span-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          <div className="md:col-span-2">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Spinner /> : "Create Account"}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-sky-600">Login</Link>
        </p>
      </Card>
    </div>
  );
}
