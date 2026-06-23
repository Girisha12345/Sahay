from decimal import Decimal

from rest_framework import serializers

from accounts.privacy import PostBookingUserSerializer, PublicUserSerializer
from accounts.models import User
from bookings.models import Booking
from services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    customer_info = serializers.SerializerMethodField()
    provider_info = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    service_title = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    review_rating = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    def _serialize_user(self, user, booking):
        if booking.status in [
            Booking.Status.IN_PROGRESS,
            Booking.Status.COMPLETED,
        ]:
            return PostBookingUserSerializer(user).data
        return PublicUserSerializer(user).data

    def get_customer_info(self, obj):
        return self._serialize_user(obj.customer, obj)

    def get_provider_info(self, obj):
        return self._serialize_user(obj.provider, obj)

    def get_provider_name(self, obj):
        provider = getattr(obj, "provider", None)
        if not provider:
            return ""
        return f"{provider.first_name or ''} {provider.last_name or ''}".strip()

    def get_service_title(self, obj):
        return getattr(obj.service, "title", "")

    def get_has_review(self, obj):
        return hasattr(obj, "review") and obj.review is not None

    def get_review_rating(self, obj):
        if hasattr(obj, "review") and obj.review is not None:
            return getattr(obj.review, "rating", None)
        return None

    def get_payment_status(self, obj):
        try:
            return obj.payment.payment_status
        except Exception:
            return None

    class Meta:
        model = Booking
        fields = [
            "id",
            "customer",
            "provider",
            "customer_info",
            "provider_info",
            "provider_name",
            "service",
            "service_title",
            "status",
            "scheduled_date",
            "scheduled_time",
            "total_price",
            "commission_amount",
            "final_provider_amount",
            "payment_method",
            "payment_status",
            "address",
            "address_line",
            "locality",
            "pincode",
            "notes",
            "has_review",
            "review_rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "commission_amount",
            "final_provider_amount",
            "customer_info",
            "provider_info",
            "has_review",
            "review_rating",
            "payment_status",
            "created_at",
            "updated_at",
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    service_id = serializers.PrimaryKeyRelatedField(
        source="service",
        queryset=Service.objects.filter(is_active=True),
        write_only=True,
    )
    service_date = serializers.DateField(source="scheduled_date", write_only=True)
    service_time = serializers.TimeField(source="scheduled_time", write_only=True)
    full_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=15)
    address_line = serializers.CharField()
    area = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    locality = serializers.CharField(required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10)
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Booking.PaymentMethod.choices)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    provider = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.PROVIDER, is_verified_provider=True),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "provider",
            "service_id",
            "full_name",
            "phone",
            "address_line",
            "area",
            "service_date",
            "service_time",
            "address",
            "locality",
            "city",
            "pincode",
            "notes",
            "payment_method",
            "total_price",
        ]

    def validate(self, attrs):
        if not attrs.get("service"):
            raise serializers.ValidationError({"service_id": "service_id is required."})
        if not attrs.get("scheduled_date"):
            raise serializers.ValidationError({"service_date": "service_date is required."})
        if not attrs.get("scheduled_time"):
            raise serializers.ValidationError({"service_time": "service_time is required."})

        from datetime import date
        scheduled_date = attrs.get("scheduled_date")
        if scheduled_date and scheduled_date < date.today():
            raise serializers.ValidationError("Service date cannot be in the past.")

        return attrs

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
        service = validated_data.pop("service")
        full_name = validated_data.pop("full_name", "")
        phone = validated_data.pop("phone", "")
        address_line = validated_data.pop("address_line", "")
        area = validated_data.pop("area", "")
        city = validated_data.pop("city", "")
        locality = validated_data.pop("locality", "")
        pincode = validated_data.pop("pincode")
        notes = validated_data.pop("notes", "")
        scheduled_date = validated_data.pop("scheduled_date")
        scheduled_time = validated_data.pop("scheduled_time")
        payment_method = validated_data.pop("payment_method")
        provider = validated_data.pop("provider")
        total_price = validated_data.pop("total_price")
        readable_address = ", ".join(part for part in [address_line, area, locality, city] if part)
        status = Booking.Status.PENDING_PAYMENT
        return Booking.objects.create(
            customer=self.context["request"].user,
            provider=provider,
            service=service,
            full_name=full_name,
            phone=phone,
            address_line=address_line,
            area=area,
            city=city,
            status=status,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            address=readable_address or address_line,
            locality=locality,
            pincode=pincode,
            notes=notes,
            payment_method=payment_method,
            total_price=total_price,
            commission_amount=commission,
            final_provider_amount=final_provider_amount,
        )


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["status"]

    def validate_status(self, value):
        allowed = {
            Booking.Status.PENDING_PAYMENT,
            Booking.Status.REJECTED,
            Booking.Status.CONFIRMED,
            Booking.Status.ACCEPTED,
            Booking.Status.IN_PROGRESS,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED,
            Booking.Status.DISPUTED,
            Booking.Status.PAYMENT_VERIFICATION_PENDING,
            Booking.Status.PAYMENT_REJECTED,
        }
        if value not in allowed:
            raise serializers.ValidationError("Invalid status transition target.")

        booking = getattr(self.instance, "status", None)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if value == Booking.Status.REJECTED:
            if not user or user.role != User.Role.PROVIDER:
                raise serializers.ValidationError("Only providers can reject a booking.")
            if booking != Booking.Status.PENDING:
                raise serializers.ValidationError("REJECTED is only allowed when the booking is PENDING.")
        return value


class BookingPaymentMethodUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["payment_method"]

    def validate_payment_method(self, value):
        allowed = {choice[0] for choice in Booking.PaymentMethod.choices}
        if value not in allowed:
            raise serializers.ValidationError("Invalid payment method.")
        return value
