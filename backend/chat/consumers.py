import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from chat.models import ChatRoom, FlaggedMessageLog, Message, contains_pii
from chat.serializers import MessageSerializer
from notifications.services import create_notification


class BookingChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		user = self.scope.get("user")
		self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
		self.group_name = f"chat_{self.booking_id}"

		if not user or user.is_anonymous or not await self._is_participant(user.id):
			await self.close(code=4003)
			return

		await self.channel_layer.group_add(self.group_name, self.channel_name)
		# also listen for booking-level events
		self.booking_group = f"booking_{self.booking_id}"
		await self.channel_layer.group_add(self.booking_group, self.channel_name)
		# presence group for online/offline indicators
		self.presence_group = f"presence_booking_{self.booking_id}"
		await self.channel_layer.group_add(self.presence_group, self.channel_name)
		# announce presence
		await self.channel_layer.group_send(self.presence_group, {"type": "presence.update", "user_id": str(self.scope["user"].id), "online": True})
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.group_name, self.channel_name)
		if hasattr(self, "booking_group"):
			await self.channel_layer.group_discard(self.booking_group, self.channel_name)
		if hasattr(self, "presence_group"):
			# announce offline
			await self.channel_layer.group_send(self.presence_group, {"type": "presence.update", "user_id": str(self.scope["user"].id), "online": False})
			await self.channel_layer.group_discard(self.presence_group, self.channel_name)

	async def receive(self, text_data=None, bytes_data=None):
		payload = json.loads(text_data or "{}")
		# typing indicator
		if payload.get("type") == "typing":
			await self.channel_layer.group_send(
				self.group_name,
				{"type": "chat.typing", "sender": self.scope["user"].id, "is_typing": bool(payload.get("is_typing"))},
			)
			return

		# mark messages read
		if payload.get("type") == "mark_read":
			# mark all messages in room as read for this recipient
			await self._mark_messages_read(self.scope["user"].id)
			await self.channel_layer.group_send(
				self.group_name,
				{"type": "chat.read", "reader": self.scope["user"].id},
			)
			return

		# normal message
		content = (payload.get("message") or "").strip()
		if not content:
			return

		if contains_pii(content):
			await self.send(text_data=json.dumps({
				"type": "error",
				"message": (
					"Your message was blocked. "
					"Sharing personal contact details (phone, email, social handles) "
					"is not permitted on Sahay."
				),
			}))
			await self._log_flagged(self.scope["user"].id, content)
			return

		message_data = await self._save_message(self.scope["user"].id, content)
		# broadcast message to chat group
		await self.channel_layer.group_send(
			self.group_name,
			{"type": "chat.message", "message": message_data},
		)
		# mark delivered (broadcasted) so UI can show a sent/delivered tick
		try:
			await self._mark_message_delivered(message_data.get("id"))
		except Exception:
			pass

	async def chat_message(self, event):
		payload = dict(event["message"])
		if payload.get("sender") is not None:
			payload["sender"] = str(payload["sender"])
		if payload.get("room") is not None:
			payload["room"] = str(payload["room"])
		payload["type"] = "message"
		await self.send(text_data=json.dumps(payload, default=str))

	async def chat_typing(self, event):
		await self.send(text_data=json.dumps({"type": "typing", "sender": str(event.get("sender")), "is_typing": event.get("is_typing", False)}, default=str))

	async def chat_read(self, event):
		await self.send(text_data=json.dumps({"type": "read", "reader": str(event.get("reader"))}, default=str))

	async def booking_update(self, event):
		# forward booking update events to the socket
		evt = event.get("event") or {}
		await self.send(text_data=json.dumps(evt, default=str))

	async def presence_update(self, event):
		await self.send(text_data=json.dumps({"type": "presence", "user_id": str(event.get("user_id")), "online": event.get("online")}, default=str))

	@database_sync_to_async
	def _is_participant(self, user_id):
		room = ChatRoom.objects.filter(
			booking_id=self.booking_id
		).select_related("booking").first()
		if not room:
			return False
		return user_id in [room.booking.customer_id, room.booking.provider_id]

	@database_sync_to_async
	def _save_message(self, user_id, content):
		room = ChatRoom.objects.select_related("booking").get(booking_id=self.booking_id)
		message = Message.objects.create(room=room, sender_id=user_id, content=content, is_read=False)
		# create notification for other participant
		try:
			other_user = room.booking.provider if user_id == room.booking.customer_id else room.booking.customer
			create_notification(
				user=other_user,
				title="New chat message",
				message=f"New message for booking #{room.booking_id}",
				notification_type="NEW_MESSAGE",
				payload={"booking_id": room.booking_id, "message_id": message.id, "sender_id": str(user_id)},
			)
		except Exception:
			pass
		return MessageSerializer(message).data

	@database_sync_to_async
	def _log_flagged(self, user_id, content):
		FlaggedMessageLog.objects.create(
			booking_id=self.booking_id,
			sender_id=user_id,
			raw_content=content,
		)

	@database_sync_to_async
	def _mark_messages_read(self, user_id):
		room = ChatRoom.objects.select_related("booking").get(booking_id=self.booking_id)
		# mark messages not sent by this user as read
		qs = Message.objects.filter(room=room, is_read=False).exclude(sender_id=user_id)
		qs.update(is_read=True)

	@database_sync_to_async
	def _mark_message_delivered(self, message_id):
		if not message_id:
			return
		msg = Message.objects.filter(pk=message_id).first()
		if not msg:
			return
		msg.is_delivered = True
		from django.utils import timezone
		msg.delivered_at = timezone.now()
		msg.save(update_fields=["is_delivered", "delivered_at"]) 
