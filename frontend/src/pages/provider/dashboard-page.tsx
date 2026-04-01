import { Link } from "react-router-dom";

import { Card } from "../../components/ui/card";
import { useServiceStore } from "../../store/serviceStore";
import { currency } from "../../utils/format";

export function ProviderDashboardPage() {
  const { services } = useServiceStore();
  const topServices = services.slice(0, 6);

  return (
    <div>
      <h1 className="text-3xl font-bold">Provider Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <h3 className="font-semibold">Incoming Requests</h3>
          <Link className="mt-2 inline-block text-sm font-semibold text-sky-600" to="/provider/bookings">Manage</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">Bookings</h3>
          <p className="mt-2 text-sm text-slate-500">Accept or reject service jobs.</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Earnings</h3>
          <Link className="mt-2 inline-block text-sm font-semibold text-sky-600" to="/provider/earnings">View</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">Profile</h3>
          <Link className="mt-2 inline-block text-sm font-semibold text-sky-600" to="/provider/profile">Edit profile</Link>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Available Services</h2>
          <Link className="text-sm font-semibold text-sky-600" to="/services">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topServices.map((service) => (
            <Card key={service.id}>
              <h3 className="font-semibold">{service.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{service.category.name}</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{currency(service.base_price)}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
