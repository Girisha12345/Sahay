from rest_framework import serializers

from payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "amount",
            "commission",
            "payment_status",
            "transaction_id",
            "provider_released_at",
            "created_at",
        ]


class PaymentIntentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
