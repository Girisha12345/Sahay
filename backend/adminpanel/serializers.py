from rest_framework import serializers

from chat.models import FlaggedMessageLog


class FlaggedMessageLogSerializer(serializers.ModelSerializer):
    sender_email = serializers.CharField(source="sender.email", read_only=True)

    class Meta:
        model = FlaggedMessageLog
        fields = ["id", "booking", "sender_email", "raw_content", "flagged_at"]


class ApproveProviderSerializer(serializers.Serializer):
    provider_id = serializers.UUIDField()
