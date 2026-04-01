import { Link } from "react-router-dom";

import { Card } from "../../components/ui/card";

export function CustomerDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Customer Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold">Bookings</h3>
          <p className="mt-2 text-sm text-slate-500">Track status and upcoming jobs.</p>
          <Link to="/customer/bookings" className="mt-3 inline-block text-sm font-semibold text-sky-600">View bookings</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">Profile</h3>
          <p className="mt-2 text-sm text-slate-500">Manage personal details and addresses.</p>
          <Link to="/customer/profile" className="mt-3 inline-block text-sm font-semibold text-sky-600">Manage profile</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">Chat</h3>
          <p className="mt-2 text-sm text-slate-500">Securely talk with providers.</p>
          <Link to="/customer/chat/1" className="mt-3 inline-block text-sm font-semibold text-sky-600">Open chat</Link>
        </Card>
      </div>
    </div>
  );
}
