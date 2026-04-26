from accounts.models import ProviderProfile, User
from rest_framework import serializers


class PublicUserSerializer(serializers.ModelSerializer):
    """
    Safe public view - hides phone, email, last_name before booking is paid.
    Use this everywhere a user profile is shown to the OTHER party.
    """
    verification_badge = serializers.SerializerMethodField()

    def get_verification_badge(self, obj):
        return getattr(getattr(obj, "provider_profile", None), "verification_status", None) == ProviderProfile.VerificationStatus.APPROVED

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "role",
            "is_verified_provider",
            "verification_badge",
        ]


class PostBookingUserSerializer(serializers.ModelSerializer):
    """
    Full contact view - only revealed AFTER booking status is
    IN_PROGRESS, COMPLETED. Never show before payment.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "phone_number",
            "email",
            "role",
            "is_verified_provider",
        ]
