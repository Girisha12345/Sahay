from decimal import Decimal

from rest_framework import serializers

from accounts.models import User
from accounts.privacy import mask_sensitive_data
from bookings.models import Booking
from services.models import Service


class BookingSerializer(serializers.ModelSerializer):
    provider_name = serializers.SerializerMethodField()
    customer_public = serializers.SerializerMethodField()
    provider_public = serializers.SerializerMethodField()
    service_description = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    review_rating = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "customer",
            "provider",
            "provider_name",
            "full_name",
            "phone",
            "address_line",
            "area",
            "customer_public",
            "provider_public",
            "service",
            "service_description",
            "status",
            "scheduled_date",
            "scheduled_time",
            "address",
            "locality",
            "city",
            "pincode",
            "notes",
            "payment_method",
            "payment_status",
            "has_review",
            "review_rating",
            "city",
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

    def get_provider_name(self, obj):
        return obj.provider.first_name

    def _is_revealed(self, obj):
        return obj.status in {
            Booking.Status.CONFIRMED,
            Booking.Status.ACCEPTED,
            Booking.Status.IN_PROGRESS,
            Booking.Status.COMPLETED,
            Booking.Status.REFUNDED,
        }

    def get_customer_public(self, obj):
        revealed = self._is_revealed(obj)
        data = mask_sensitive_data(obj.customer, reveal_contact=revealed)
        data["completed_jobs"] = Booking.objects.filter(customer=obj.customer, status=Booking.Status.COMPLETED).count()
        return data

    def get_provider_public(self, obj):
        revealed = self._is_revealed(obj)
        data = mask_sensitive_data(obj.provider, reveal_contact=revealed)
        data["completed_jobs"] = Booking.objects.filter(provider=obj.provider, status=Booking.Status.COMPLETED).count()
        data["city"] = getattr(getattr(obj.provider, "provider_profile", None), "city", "")
        return data

    def get_service_description(self, obj):
        return obj.service.description

    def get_city(self, obj):
        return getattr(getattr(obj.provider, "provider_profile", None), "city", "")

    def get_payment_status(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.payment_status if payment else None

    def get_has_review(self, obj):
        return hasattr(obj, "review") and obj.review is not None

    def get_review_rating(self, obj):
        if hasattr(obj, "review") and obj.review is not None:
            return obj.review.rating
        return None


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
        status = Booking.Status.PENDING_PAYMENT if payment_method == Booking.PaymentMethod.CASH else Booking.Status.PENDING
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
            Booking.Status.CONFIRMED,
            Booking.Status.ACCEPTED,
            Booking.Status.IN_PROGRESS,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED,
            Booking.Status.DISPUTED,
        }
        if value not in allowed:
            raise serializers.ValidationError("Invalid status transition target.")
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
