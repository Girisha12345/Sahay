from rest_framework import serializers

from support.models import SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ["id", "user", "booking", "subject", "description", "status", "created_at"]
        read_only_fields = ["id", "user", "status", "created_at"]
