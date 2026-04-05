import json
import re

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from bookings.models import Booking
from chat.models import ChatRoom, Message
from chat.serializers import MessageSerializer
from notifications.models import Notification
from notifications.services import create_notification

PHONE_PATTERN = re.compile(r"\b\d{10}\b")
EMAIL_PATTERN = re.compile(r"\b[\w\.-]+@[\w\.-]+\.\w+\b")
SOCIAL_PATTERN = re.compile(r"\b(instagram|insta|ig|whatsapp|wa)\b", re.IGNORECASE)


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
        if payload.get("type") == "typing":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat.typing",
                    "sender": str(self.scope["user"].id),
                    "is_typing": bool(payload.get("is_typing", False)),
                },
            )
            return

        content = (payload.get("message") or "").strip()
        if not content:
            return

        if self._contains_contact_details(content):
            await self._save_message(self.scope["user"].id, content, flagged=True)
            await self.send(
                text_data=json.dumps(
                    {
                        "detail": "Phone numbers, email addresses, and social handles are not allowed before booking completion.",
                        "blocked": True,
                    }
                )
            )
            return

        message_data = await self._save_message(self.scope["user"].id, content, flagged=False)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message": message_data,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def chat_typing(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "typing",
                    "sender": event["sender"],
                    "is_typing": event["is_typing"],
                }
            )
        )

    @database_sync_to_async
    def _is_participant(self, user_id):
        booking = Booking.objects.filter(id=self.booking_id).first()
        if not booking:
            return False
        return user_id in [booking.customer_id, booking.provider_id]

    @database_sync_to_async
    def _save_message(self, user_id, content, flagged=False):
        room, _ = ChatRoom.objects.get_or_create(booking_id=self.booking_id)
        room = ChatRoom.objects.select_related("booking").get(id=room.id)
        message = Message.objects.create(room=room, sender_id=user_id, content=content, is_flagged=flagged)
        if flagged:
            return MessageSerializer(message).data

        other_user = room.booking.provider if user_id == room.booking.customer_id else room.booking.customer
        create_notification(
            user=other_user,
            title="New chat message",
            message=f"New message for booking #{room.booking_id}",
            notification_type=Notification.NotificationType.NEW_MESSAGE,
            payload={"booking_id": room.booking_id, "message_id": message.id, "sender_id": user_id},
        )
        return MessageSerializer(message).data

    def _contains_contact_details(self, content):
        return bool(PHONE_PATTERN.search(content) or EMAIL_PATTERN.search(content) or SOCIAL_PATTERN.search(content))
