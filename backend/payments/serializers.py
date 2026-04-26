from rest_framework import serializers

from payments.models import Payment, ProviderWallet, WalletTransaction


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "amount",
            "commission",
            "payment_method",
            "payment_status",
            "transaction_id",
            "provider_released_at",
            "created_at",
        ]


class PaymentIntentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class StripeIntentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class PaymentOrderCreateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class PaymentVerifySerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    payment_id = serializers.CharField(max_length=255)
    order_id = serializers.CharField(max_length=255)
    signature = serializers.CharField(max_length=255, required=False, allow_blank=True)


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = [
            "id",
            "booking",
            "tx_type",
            "amount",
            "commission_deducted",
            "description",
            "created_at",
        ]


class ProviderWalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = ProviderWallet
        fields = ["total_earned", "total_commission_deducted", "pending_payout", "updated_at", "transactions"]
