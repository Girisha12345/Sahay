from rest_framework import serializers

from chat.models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "room", "sender", "sender_email", "content", "is_flagged", "created_at"]
        read_only_fields = ["id", "sender", "is_flagged", "created_at", "sender_email"]
