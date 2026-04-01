import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, user } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    await login(values.email, values.password);
    await useAuthStore.getState().loadProfile();
    const role = useAuthStore.getState().user?.role;
    if (role === "PROVIDER") navigate("/provider/dashboard");
    else if (role === "ADMIN") navigate("/admin/dashboard");
    else navigate("/customer/dashboard");
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Login to continue to Sahāy.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input placeholder="Email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          {error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          New here? <Link to="/register" className="font-semibold text-sky-600">Create account</Link>
        </p>
      </Card>
      {user && <p className="mt-3 text-center text-sm text-slate-500">Logged in as {user.email}</p>}
    </div>
  );
}
