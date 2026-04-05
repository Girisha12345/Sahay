import { useEffect, useState } from "react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { supportService } from "../../services/supportService";

type SupportTicket = {
  id: number;
  subject: string;
  description: string;
  status: string;
  created_at: string;
};

export function SupportDashboardPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: ticketsData } = await supportService.tickets();
        setTickets(ticketsData);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Tickets</p>
          <p className="mt-2 text-2xl font-bold">{tickets.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Open Queue</p>
          <p className="mt-2 text-2xl font-bold">{tickets.filter((ticket) => ticket.status === "OPEN").length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">In Review</p>
          <p className="mt-2 text-2xl font-bold">{tickets.filter((ticket) => ticket.status === "IN_REVIEW").length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Support Tickets</h2>
        <div className="mt-4 space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-xl border border-slate-200 p-4 hover:bg-gray-50">
              <p className="font-semibold">{ticket.subject}</p>
              <p className="mt-1 text-sm text-slate-500">{ticket.description}</p>
              <p className="mt-2 text-xs text-slate-400">{ticket.status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}