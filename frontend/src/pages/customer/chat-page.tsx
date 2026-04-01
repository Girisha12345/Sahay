import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useChatStore } from "../../store/chatStore";

export function CustomerChatPage() {
  const { bookingId } = useParams();
  const [message, setMessage] = useState("");
  const { messages, connect, send, disconnect } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingId) return;
    connect(Number(bookingId));
    return () => disconnect();
  }, [bookingId, connect, disconnect]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSend = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    send(message);
    setMessage("");
  };

  return (
    <Card className="mx-auto flex max-w-3xl flex-col">
      <h1 className="mb-3 text-xl font-bold">Chat with Provider</h1>
      <div ref={containerRef} className="h-[420px] space-y-3 overflow-y-auto rounded-xl bg-slate-100 p-3">
        {messages.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="ml-auto max-w-[75%] rounded-2xl bg-sky-600 px-4 py-2 text-sm text-white"
          >
            <p>{item.content}</p>
            <p className="mt-1 text-[10px] text-sky-100">{new Date(item.created_at).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
      <form className="mt-3 flex gap-2" onSubmit={onSend}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-slate-300 px-3"
          placeholder="Type your message"
        />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
}
