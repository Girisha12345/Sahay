from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from support.models import SupportTicket
from support.permissions import IsSupportAgentOrAdmin
from support.serializers import SupportTicketSerializer
from chat.models import Message
from chat.serializers import MaskedMessageSerializer


class SupportTicketCreateView(generics.CreateAPIView):
	serializer_class = SupportTicketSerializer

	def perform_create(self, serializer):
		ticket = serializer.save(user=self.request.user)
		try:
			from notifications.services import notify_admins
			notify_admins(
				title="Service Complaint Filed",
				message=f"Support ticket #{ticket.id} filed by {ticket.user.email}: '{ticket.subject}'.",
				notification_type="SERVICE_COMPLAINT",
				payload={"ticket_id": ticket.id},
			)
		except Exception:
			pass


class SupportTicketListView(generics.ListAPIView):
	serializer_class = SupportTicketSerializer

	def get_queryset(self):
		# guard anonymous and swagger fake views
		if getattr(self, "swagger_fake_view", False) or getattr(self.request.user, "is_anonymous", True):
			return SupportTicket.objects.none()
		if self.request.user.role in [User.Role.SUPPORT_AGENT, User.Role.ADMIN]:
			return SupportTicket.objects.all().order_by("-created_at")
		return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")


class SupportTicketListCreateView(generics.ListCreateAPIView):
	serializer_class = SupportTicketSerializer

	def get_queryset(self):
		if getattr(self, "swagger_fake_view", False) or getattr(self.request.user, "is_anonymous", True):
			return SupportTicket.objects.none()
		if self.request.user.role in [User.Role.SUPPORT_AGENT, User.Role.ADMIN]:
			return SupportTicket.objects.all().order_by("-created_at")
		return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")

	def perform_create(self, serializer):
		ticket = serializer.save(user=self.request.user)
		try:
			from notifications.services import notify_admins
			notify_admins(
				title="Service Complaint Filed",
				message=f"Support ticket #{ticket.id} filed by {ticket.user.email}: '{ticket.subject}'.",
				notification_type="SERVICE_COMPLAINT",
				payload={"ticket_id": ticket.id},
			)
		except Exception:
			pass


class SupportTicketUpdateView(generics.UpdateAPIView):
	queryset = SupportTicket.objects.all()
	serializer_class = SupportTicketSerializer
	permission_classes = [IsSupportAgentOrAdmin]
	http_method_names = ["patch"]


class SupportChatAuditView(APIView):
	permission_classes = [IsSupportAgentOrAdmin]

	def get(self, request, ticket_id):
		ticket = SupportTicket.objects.filter(id=ticket_id).first()
		if not ticket:
			return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)
		if not ticket.booking:
			return Response({"detail": "No booking linked to this ticket."}, status=status.HTTP_404_NOT_FOUND)
		messages = Message.objects.filter(room__booking=ticket.booking).select_related("sender").order_by("created_at")
		return Response(MaskedMessageSerializer(messages, many=True).data)
