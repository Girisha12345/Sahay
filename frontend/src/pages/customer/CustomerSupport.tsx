import { useEffect, useState } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { supportService } from "../../services/supportService";
import type { SupportTicketItem } from "../../types";

type TicketForm = {
  subject: string;
  description: string;
  booking: string;
};

export function CustomerSupport() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TicketForm>({ subject: "", description: "", booking: "" });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await supportService.tickets();
      setTickets(data);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTickets();
  }, []);

  const onSubmit = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await supportService.createTicket({
        subject: form.subject,
        description: form.description,
        booking: form.booking ? Number(form.booking) : null,
      });
      setMessage("Support ticket submitted successfully.");
      setForm({ subject: "", description: "", booking: "" });
      await fetchTickets();
    } catch (submitError) {
      setError((submitError as Error).message || "Unable to submit ticket.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
        <p className="mt-2 text-sm text-slate-500">Raise a support ticket and keep track of previous issues.</p>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Subject" value={form.subject} onChange={(event) => setForm((state) => ({ ...state, subject: event.target.value }))} />
          <Input placeholder="Booking ID (optional)" value={form.booking} onChange={(event) => setForm((state) => ({ ...state, booking: event.target.value }))} />
          <textarea
            placeholder="Message"
            className="min-h-32 rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            value={form.description}
            onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => void onSubmit()} disabled={saving}>
            {saving ? "Submitting..." : "Submit ticket"}
          </Button>
        </div>
        {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </Card>

      <div>
        <h2 className="mb-3 text-xl font-bold text-slate-900">Previous support tickets</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : tickets.length ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{ticket.subject}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{ticket.description}</p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{ticket.status}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">No support tickets yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}