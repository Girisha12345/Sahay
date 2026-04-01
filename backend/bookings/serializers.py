from decimal import Decimal

from rest_framework import serializers

from accounts.models import User
from bookings.models import Booking
from services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "customer",
            "provider",
            "service",
            "status",
            "scheduled_date",
            "scheduled_time",
            "total_price",
            "commission_amount",
            "final_provider_amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "status",
            "commission_amount",
            "final_provider_amount",
            "created_at",
            "updated_at",
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    provider = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.PROVIDER, is_verified_provider=True),
        required=False,
        allow_null=True,
    )
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.filter(is_active=True))

    class Meta:
        model = Booking
        fields = ["id", "provider", "service", "scheduled_date", "scheduled_time", "total_price"]

    def create(self, validated_data):
        provider = validated_data.get("provider")
        if not provider:
            provider = User.objects.filter(
                role=User.Role.PROVIDER,
                is_verified_provider=True,
            ).first()
            if not provider:
                raise serializers.ValidationError("No verified providers available.")
            validated_data["provider"] = provider

        total_price = validated_data["total_price"]
        commission = (Decimal(total_price) * Decimal("0.10")).quantize(Decimal("0.01"))
        final_provider_amount = Decimal(total_price) - commission
        validated_data["status"] = Booking.Status.PENDING
        return Booking.objects.create(
            customer=self.context["request"].user,
            commission_amount=commission,
            final_provider_amount=final_provider_amount,
            **validated_data,
        )


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["status"]

    def validate_status(self, value):
        allowed = {
            Booking.Status.ACCEPTED,
            Booking.Status.IN_PROGRESS,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED,
            Booking.Status.DISPUTED,
        }
        if value not in allowed:
            raise serializers.ValidationError("Invalid status transition target.")
        return value
