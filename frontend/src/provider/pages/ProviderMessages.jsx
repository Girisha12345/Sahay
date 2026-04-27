import { useEffect, useState } from "react";

import { ProviderLayout } from "../components/ProviderLayout";
import { ChatBox } from "../components/ChatBox";
import { Spinner } from "../../components/ui/spinner";
import { bookingService } from "../../services/bookingService";
import { providerServiceApi } from "../../services/providerServiceApi";
import { useChatSocket } from "../../hooks/useChatSocket";
import { useAuthStore } from "../../store/authStore";

function ChatThread({ booking }) {
  const { accessToken } = useAuthStore();
  const { messages, sendMessage, connected, blocked } = useChatSocket(booking.id, accessToken);

  const conversation = messages.map((m) => ({
    id: m.id,
    text: m.message_text,
    time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    me: m.sender_role !== "CUSTOMER",
  }));

  return (
    <div>
      {!connected && <p className="mb-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">Connecting to chat...</p>}
      {blocked && <p className="mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{blocked}</p>}
      <ChatBox conversation={conversation} onSend={sendMessage} />
    </div>
  );
}

export function ProviderMessages() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([bookingService.providerBookings(), providerServiceApi.getMyServices()])
      .then(([bookingResponse, serviceResponse]) => {
        const active = (bookingResponse.data ?? []).filter((b) => ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(b.status));
        setBookings(active);
        setServices(serviceResponse.data ?? []);
        if (active.length > 0) setSelected(active[0]);
      })
      .catch(() => {
        setBookings([]);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const serviceMap = new Map(services.map((service) => [service.id, service.title]));

  return (
    <ProviderLayout title="Messages" subtitle="Stay connected with your customers">
      {loading ? (
        <div className="flex h-64 items-center justify-center"><Spinner /></div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="font-semibold text-slate-600">No active chats</p>
          <p className="mt-1 text-sm text-slate-400">Chat becomes available when a booking is accepted.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="px-2 py-2 text-sm font-semibold text-slate-900">Bookings</h3>
            <div className="space-y-1">
              {bookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className={`w-full rounded-xl px-3 py-2 text-left ${selected?.id === b.id ? "bg-sky-50" : "hover:bg-slate-50"}`}
                >
                  <p className="text-sm font-semibold text-slate-900">{b.customer_info?.first_name || b.customer_public?.first_name || "Customer"}</p>
                  <p className="text-xs text-slate-500">{serviceMap.get(b.service) || "Service"}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            {selected && (
              <>
                <div className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  Chatting about booking <span className="font-semibold text-slate-900">#{selected.id}</span>
                </div>
                <ChatThread booking={selected} />
              </>
            )}
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
