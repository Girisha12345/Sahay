import { Circle, MessageSquareDashed, Paperclip, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useParams } from "react-router-dom";

import { BackButton } from "../../components/BackButton";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { useChatSocket } from "../../hooks/useChatSocket";
import { bookingService } from "../../services/bookingService";
import { serviceService } from "../../services/serviceService";
import { useAuthStore } from "../../store/authStore";
import type { Booking } from "../../types";

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function ChatPage() {
  const { bookingId } = useParams();
  const parsedBookingId = bookingId ? Number(bookingId) : null;
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState("");
  const [headerLoading, setHeaderLoading] = useState(true);
  const [providerName, setProviderName] = useState("Provider");
  const [serviceName, setServiceName] = useState("Service");
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    messages,
    isConnecting,
    isConnected,
    isReconnecting,
    isProviderTyping,
    warning,
    sendMessage,
    sendTyping,
  } = useChatSocket(parsedBookingId, user);

  useEffect(() => {
    const loadHeader = async () => {
      if (!parsedBookingId) {
        setHeaderLoading(false);
        return;
      }

      setHeaderLoading(true);
      try {
        const { data: customerBookings } = await bookingService.customerBookings();
        const booking = (customerBookings as Booking[]).find((item) => item.id === parsedBookingId);
        if (booking) {
          setProviderName(booking.provider_name || "Provider");
          const { data: serviceDetails } = await serviceService.serviceById(booking.service);
          setServiceName(serviceDetails?.title || "Service");
        }
      } finally {
        setHeaderLoading(false);
      }
    };

    void loadHeader();
  }, [parsedBookingId]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSend = async () => {
    if (!messageText.trim()) {
      return;
    }
    await sendMessage(messageText);
    sendTyping(false);
    setMessageText("");
  };

  const onEnterPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void onSend();
    }
  };

  const onTypingChange = (nextText: string) => {
    setMessageText(nextText);
    if (!nextText.trim()) {
      sendTyping(false);
      return;
    }

    sendTyping(true);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1200);
  };

  const connectionLabel = useMemo(() => {
    if (isReconnecting) return "Reconnecting...";
    if (isConnecting) return "Connecting...";
    return isConnected ? "Online" : "Offline";
  }, [isConnecting, isConnected, isReconnecting]);

  const statusColor = useMemo(() => {
    if (isReconnecting || isConnecting) return "text-amber-600";
    return isConnected ? "text-emerald-600" : "text-slate-500";
  }, [isConnected, isConnecting, isReconnecting]);

  return (
    <div className="mx-auto max-w-5xl space-y-3">
      <BackButton 
        fallback={`/bookings/${parsedBookingId}`}
        label="← Back to Booking"
      />
      <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          {headerLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Spinner />
              <span className="text-sm">Loading chat details...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Chat with {providerName}</h1>
                <p className="text-sm text-slate-500">{serviceName}</p>
                <p className="text-sm text-slate-400">Booking ID #{parsedBookingId}</p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium ${statusColor}`}>
                <Circle className="h-3 w-3 fill-current" />
                {connectionLabel}
              </div>
            </div>
          )}
        </div>

        <div
          ref={messageContainerRef}
          className="mt-4 h-[500px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          {isConnecting && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center gap-2 text-slate-500">
              <Spinner />
              <span>Connecting to realtime chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <MessageSquareDashed className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Start conversation with provider</p>
            </div>
          ) : (
            messages.map((item) => {
              const isCustomerMessage = item.sender_role === "CUSTOMER";
              const isSystemMessage = item.sender_role === "SYSTEM";

              if (isSystemMessage) {
                return (
                  <div key={`${item.id}-${item.timestamp}`} className="flex justify-center">
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      {item.message_text}
                    </p>
                  </div>
                );
              }

              return (
                <div key={`${item.id}-${item.timestamp}`} className={`flex ${isCustomerMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-xl px-3 py-3 shadow-sm ${
                      isCustomerMessage
                        ? "bg-sky-600 text-white"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    <p className="text-sm leading-5">{item.message_text}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className={`${isCustomerMessage ? "text-sky-100" : "text-slate-400"}`}>{formatTime(item.timestamp)}</span>
                      {isCustomerMessage && (
                        <span className="text-[11px] text-sky-100">
                          {item.is_read ? "✓✓" : item.is_delivered ? "✓" : "…"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isProviderTyping && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-slate-200 px-3 py-2 text-xs text-slate-700">Provider is typing...</div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
          <button
            type="button"
            aria-label="Attach file"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <Input
            placeholder="Type your message"
            value={messageText}
            onChange={(event) => onTypingChange(event.target.value)}
            onKeyDown={onEnterPress}
            className="border-0 shadow-none focus:ring-0"
          />
          <Button onClick={() => void onSend()} disabled={!messageText.trim()} className="rounded-lg gap-2">
            <SendHorizonal className="h-4 w-4" />
            Send
          </Button>
        </div>
        {warning && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-700">{warning}</p>}
      </Card>
    </div>
  );
}