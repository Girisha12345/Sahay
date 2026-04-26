import { useEffect, useState } from "react";

import { Card } from "../../components/ui/card";
import { Spinner } from "../../components/ui/spinner";
import { adminService, type FlaggedChatRecord } from "../../services/adminService";

export function AdminFlaggedChatsPage() {
  const [flaggedChats, setFlaggedChats] = useState<FlaggedChatRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFlaggedChats = async () => {
      try {
        const { data } = await adminService.getFlaggedChats();
        if (isMounted) {
          setFlaggedChats(data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage((error as Error).message || "Unable to load flagged chats.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFlaggedChats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-10">
        <Spinner />
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Flagged Chats</h1>
      <p className="mt-1 text-sm text-slate-500">Monitor policy violations in in-app conversations.</p>
      {message && <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</p>}
      <div className="mt-5 space-y-3">
        {flaggedChats.map((entry) => (
          <Card key={entry.id}>
            <p className="font-semibold text-slate-900">{entry.raw_content}</p>
            <p className="mt-1 text-sm text-rose-700">
              Booking #{entry.booking_id || "N/A"} · {entry.sender_email}
            </p>
            <p className="mt-1 text-xs text-slate-500">Flagged at {new Date(entry.flagged_at).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
