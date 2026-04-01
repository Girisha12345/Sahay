from rest_framework import generics

from chat.models import Message
from chat.permissions import IsChatParticipant
from chat.serializers import MessageSerializer


class BookingChatHistoryView(generics.ListAPIView):
	serializer_class = MessageSerializer
	permission_classes = [IsChatParticipant]

	def get_queryset(self):
		booking_id = self.kwargs["booking_id"]
		return Message.objects.filter(room__booking_id=booking_id).select_related("sender").order_by("created_at")
