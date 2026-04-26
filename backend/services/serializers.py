from rest_framework import serializers

from services.models import Category, Service


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "is_active"]


class PublicServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_name",
            "provider_name",
            "base_price",
            "duration_minutes",
            "location",
            "rating",
            "total_reviews",
            "is_active",
        ]

    def get_provider_name(self, obj):
        if not obj.provider:
            return ""
        full_name = f"{obj.provider.first_name} {obj.provider.last_name}".strip()
        return full_name or obj.provider.email


class ProviderServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    provider_name = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_name",
            "provider",
            "provider_name",
            "base_price",
            "duration_minutes",
            "location",
            "rating",
            "total_reviews",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["provider", "rating", "total_reviews", "created_at", "updated_at"]

    def get_provider_name(self, obj):
        if not obj.provider:
            return ""
        full_name = f"{obj.provider.first_name} {obj.provider.last_name}".strip()
        return full_name or obj.provider.email
