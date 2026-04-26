import { useState } from "react";

import { ProviderLayout } from "../components/ProviderLayout";
import { ChatBox } from "../components/ChatBox";
import { chatFallback } from "../mockData";

const customers = [
  { id: 1, name: "Rohit Kumar", service: "Fan Installation" },
  { id: 2, name: "Asha N", service: "Plumbing Repair" },
  { id: 3, name: "Prakash S", service: "Switchboard Repair" },
];

export function ProviderMessages() {
  const [selected, setSelected] = useState(customers[0]);
  const [messages, setMessages] = useState(chatFallback);

  const onSend = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), me: true },
    ]);
  };

  return (
    <ProviderLayout title="Messages" subtitle="Stay connected with your customers">
      <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <h3 className="px-2 py-2 text-sm font-semibold text-slate-900">Customer list</h3>
          <div className="space-y-1">
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className={`w-full rounded-xl px-3 py-2 text-left ${selected.id === c.id ? "bg-sky-50" : "hover:bg-slate-50"}`}
              >
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">{c.service}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            Chatting with <span className="font-semibold text-slate-900">{selected.name}</span>
          </div>
          <ChatBox conversation={messages} onSend={onSend} />
        </div>
      </div>
    </ProviderLayout>
  );
}
