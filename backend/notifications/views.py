from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from notifications.serializers import NotificationCreateSerializer, NotificationSerializer


class NotificationListView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer

    def get_serializer_class(self):
        if self.request.method == "POST":
            return NotificationCreateSerializer
        return NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationMarkReadView(APIView):
    def patch(self, request, pk):
        notification = Notification.objects.filter(pk=pk, user=request.user).first()
        if not notification:
            return Response({"detail": "Notification not found."}, status=404)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)
