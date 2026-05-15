import re

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from chat.models import ChatRoom, Message
from chat.permissions import IsChatParticipant
from chat.serializers import MessageSerializer
from notifications.models import Notification
from notifications.services import create_notification

PHONE_PATTERN = re.compile(r"\b\d{10}\b")
EMAIL_PATTERN = re.compile(r"\b[\w\.-]+@[\w\.-]+\.\w+\b")
SOCIAL_PATTERN = re.compile(r"\b(instagram|insta|ig|facebook|telegram|whatsapp|wa|wa\.me|t\.me)\b", re.IGNORECASE)


class ChatSendMessageView(APIView):
	permission_classes = [IsChatParticipant]

	def post(self, request):
		booking_id = request.data.get("booking_id")
		content = (request.data.get("message") or "").strip()
		if not booking_id or not content:
			return Response({"detail": "booking_id and message are required."}, status=400)

		if self._contains_contact_details(content):
			message = self._save_message(request.user, booking_id, content, flagged=True)
			return Response(
				{
					"detail": "Sharing contact details is not allowed before booking confirmation.",
					"message": message.data,
				},
				status=status.HTTP_400_BAD_REQUEST,
			)

		message = self._save_message(request.user, booking_id, content, flagged=False)
		return Response(message.data, status=status.HTTP_201_CREATED)

	def _contains_contact_details(self, content):
		return bool(PHONE_PATTERN.search(content) or EMAIL_PATTERN.search(content) or SOCIAL_PATTERN.search(content))

	def _save_message(self, user, booking_id, content, flagged=False):
		room, _ = ChatRoom.objects.get_or_create(booking_id=booking_id)
		message = Message.objects.create(room=room, sender=user, content=content, is_flagged=flagged)
		if not flagged:
			other_user = room.booking.provider if user.id == room.booking.customer_id else room.booking.customer
			create_notification(
				user=other_user,
				title="New chat message",
				message=f"New message for booking #{room.booking_id}",
				notification_type=Notification.NotificationType.NEW_MESSAGE,
				payload={"booking_id": room.booking_id, "message_id": message.id, "sender_id": str(user.id)},
			)
		return MessageSerializer(message)


class BookingChatHistoryView(generics.ListAPIView):
	serializer_class = MessageSerializer
	permission_classes = [IsChatParticipant]

	def get_queryset(self):
		booking_id = self.kwargs.get("booking_id") or self.request.query_params.get("booking_id")
		return Message.objects.filter(room__booking_id=booking_id).select_related("sender").order_by("created_at")


class MarkMessagesReadView(APIView):
	permission_classes = [IsChatParticipant]

	def post(self, request, booking_id=None):
		booking_id = booking_id or request.data.get("booking_id")
		room = ChatRoom.objects.filter(booking_id=booking_id).first()
		if not room:
			return Response({"detail": "Chat room not found."}, status=404)

		# mark unread messages not sent by requester as read
		msgs = Message.objects.filter(room=room, is_read=False).exclude(sender=request.user)
		msgs.update(is_read=True)
		return Response({"updated": msgs.count()}, status=200)
