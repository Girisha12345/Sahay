import { Card } from "../../components/ui/card";

const flagged = [
  { id: 1, message: "Call me at 9876543210", risk: "Phone number detected" },
  { id: 2, message: "Message on WhatsApp", risk: "Off-platform contact attempt" },
];

export function AdminFlaggedChatsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Flagged Chats</h1>
      <p className="mt-1 text-sm text-slate-500">Monitor policy violations in in-app conversations.</p>
      <div className="mt-5 space-y-3">
        {flagged.map((entry) => (
          <Card key={entry.id}>
            <p className="font-semibold text-slate-900">{entry.message}</p>
            <p className="mt-1 text-sm text-rose-700">{entry.risk}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
