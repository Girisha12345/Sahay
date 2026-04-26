import { SendHorizonal } from "lucide-react";
import { useState } from "react";

export function ChatBox({ conversation = [], onSend }) {
  const [message, setMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage("");
  };

  return (
    <div className="flex h-[65vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-semibold text-slate-900">Conversation</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          conversation.map((msg) => (
            <div key={msg.id} className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.me ? "ml-auto bg-sky-600 text-white" : "bg-slate-100 text-slate-800"}`}>
              <p>{msg.text}</p>
              <p className={`mt-1 text-[10px] ${msg.me ? "text-sky-100" : "text-slate-500"}`}>{msg.time}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="h-11 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-sky-500"
        />
        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700">
          <SendHorizonal className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}
