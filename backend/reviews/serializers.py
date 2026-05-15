from rest_framework import serializers

from reviews.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField(read_only=True)
    service_name = serializers.SerializerMethodField(read_only=True)
    provider_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "booking",
            "service",
            "customer",
            "customer_name",
            "service_name",
            "provider_name",
            "rating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "customer", "customer_name", "service_name", "provider_name"]
        extra_kwargs = {
            "service": {"required": False, "allow_null": True},
            "booking": {"required": False, "allow_null": True},
        }

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def get_customer_name(self, obj):
        if getattr(obj, "customer", None):
            return obj.customer.first_name or "Customer"
        if getattr(obj, "user", None):
            return obj.user.first_name or "Customer"
        return "Customer"

    def get_service_name(self, obj):
        if getattr(obj, "service", None):
            return obj.service.title
        if getattr(obj, "booking", None) and getattr(obj.booking, "service", None):
            return obj.booking.service.title
        return "Service"

    def get_provider_name(self, obj):
        provider = None
        if getattr(obj, "booking", None) and getattr(obj.booking, "provider", None):
            provider = obj.booking.provider
        if provider:
            return provider.first_name or "Provider"
        return "Provider"
