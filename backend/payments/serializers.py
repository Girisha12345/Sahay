from rest_framework import serializers

from payments.models import Payment, ProviderWallet, WalletTransaction, PaymentProof


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


class PaymentProofSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    booking_service_title = serializers.CharField(source="booking.service.title", read_only=True)
    booking_customer_name = serializers.CharField(source="booking.full_name", read_only=True)

    class Meta:
        model = PaymentProof
        fields = [
            "id",
            "booking",
            "customer",
            "customer_email",
            "booking_service_title",
            "booking_customer_name",
            "amount_expected",
            "amount_paid",
            "utr_number",
            "screenshot",
            "status",
            "created_at",
        ]
        read_only_fields = ["customer", "status", "created_at"]
