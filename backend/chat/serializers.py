import re

from rest_framework import serializers

from chat.models import CONTACT_SHARE_PATTERNS, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "room",
            "sender",
            "sender_email",
            "content",
            "is_flagged",
            "is_delivered",
            "delivered_at",
            "is_read",
            "read_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "sender",
            "is_flagged",
            "created_at",
            "sender_email",
            "is_read",
            "read_at",
            "is_delivered",
            "delivered_at",
        ]


class MaskedMessageSerializer(serializers.ModelSerializer):
    """
    Masks any PII in message content before returning to Customer Care.
    Replaces phone numbers, emails, and social handles with ***.
    """
    content = serializers.SerializerMethodField()
    sender_email = serializers.CharField(source="sender.email", read_only=True)

    def get_content(self, obj):
        text = obj.content
        for pattern in CONTACT_SHARE_PATTERNS:
            text = pattern.sub("***", text)
        return text

    class Meta:
        model = Message
        fields = ["id", "sender_email", "content", "created_at", "is_flagged"]
