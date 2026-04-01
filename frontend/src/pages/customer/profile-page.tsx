import { Card } from "../../components/ui/card";
import { useAuthStore } from "../../store/authStore";

export function CustomerProfilePage() {
  const { user } = useAuthStore();

  return (
    <Card className="max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-4 text-sm text-slate-600">Name: {user?.first_name} {user?.last_name}</p>
      <p className="text-sm text-slate-600">Email: {user?.email}</p>
      <p className="text-sm text-slate-600">Phone: {user?.phone_number}</p>
    </Card>
  );
}
