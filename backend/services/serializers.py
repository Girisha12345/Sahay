from rest_framework import serializers

from services.models import Category, Service


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "is_active", "created_at"]


class ServiceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
        source="category",
        write_only=True,
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "category",
            "category_id",
            "title",
            "description",
            "base_price",
            "is_active",
            "created_at",
            "updated_at",
        ]
