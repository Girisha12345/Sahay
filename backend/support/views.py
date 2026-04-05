from rest_framework import generics

from accounts.models import User
from support.models import SupportTicket
from support.permissions import IsSupportAgentOrAdmin
from support.serializers import SupportTicketSerializer


class SupportTicketCreateView(generics.CreateAPIView):
	serializer_class = SupportTicketSerializer

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


class SupportTicketListView(generics.ListAPIView):
	serializer_class = SupportTicketSerializer

	def get_queryset(self):
		if self.request.user.role in [User.Role.SUPPORT_AGENT, User.Role.ADMIN]:
			return SupportTicket.objects.all().order_by("-created_at")
		return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")


class SupportTicketListCreateView(generics.ListCreateAPIView):
	serializer_class = SupportTicketSerializer

	def get_queryset(self):
		if self.request.user.role in [User.Role.SUPPORT_AGENT, User.Role.ADMIN]:
			return SupportTicket.objects.all().order_by("-created_at")
		return SupportTicket.objects.filter(user=self.request.user).order_by("-created_at")

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


class SupportTicketUpdateView(generics.UpdateAPIView):
	queryset = SupportTicket.objects.all()
	serializer_class = SupportTicketSerializer
	permission_classes = [IsSupportAgentOrAdmin]
	http_method_names = ["patch"]
