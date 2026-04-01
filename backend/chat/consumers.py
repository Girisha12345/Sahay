import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from chat.models import ChatRoom, Message
from chat.serializers import MessageSerializer


class BookingChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
        self.group_name = f"chat_{self.booking_id}"

        if not user or user.is_anonymous or not await self._is_participant(user.id):
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        payload = json.loads(text_data or "{}")
        content = (payload.get("message") or "").strip()
        if not content:
            return

        message_data = await self._save_message(self.scope["user"].id, content)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message": message_data,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def _is_participant(self, user_id):
        room = ChatRoom.objects.filter(booking_id=self.booking_id).select_related("booking").first()
        if not room:
            return False
        return user_id in [room.booking.customer_id, room.booking.provider_id]

    @database_sync_to_async
    def _save_message(self, user_id, content):
        room = ChatRoom.objects.select_related("booking").get(booking_id=self.booking_id)
        message = Message.objects.create(room=room, sender_id=user_id, content=content)
        return MessageSerializer(message).data
