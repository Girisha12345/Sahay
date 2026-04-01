from rest_framework import serializers

from chat.models import Message


class FlaggedMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender_email", "content", "is_flagged", "created_at"]


class ApproveProviderSerializer(serializers.Serializer):
    provider_id = serializers.UUIDField()
