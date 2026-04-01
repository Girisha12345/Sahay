import { WS_BASE_URL } from "../utils/constants";

export const chatService = {
  connectSocket: (bookingId: number) => new WebSocket(`${WS_BASE_URL}/ws/chat/${bookingId}/`),
  sendMessage: (socket: WebSocket, message: string) => {
    socket.send(JSON.stringify({ message }));
  },
  receiveMessage: (socket: WebSocket, onMessage: (data: unknown) => void) => {
    socket.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };
  },
};
