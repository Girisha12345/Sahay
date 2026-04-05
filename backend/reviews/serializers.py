from rest_framework import serializers

from reviews.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "service", "user", "user_name", "booking", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at", "user", "user_name"]
        extra_kwargs = {
            "service": {"required": False, "allow_null": True},
            "booking": {"required": False, "allow_null": True},
        }

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def get_user_name(self, obj):
        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name or obj.user.email
