from rest_framework import serializers

from notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "title",
            "message",
            "notification_type",
            "is_read",
            "payload",
            "created_at",
        ]
        read_only_fields = fields


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "notification_type", "payload"]
        read_only_fields = ["id"]
