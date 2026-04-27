from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from accounts.models import ProviderProfile, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "role",
            "is_verified_provider",
            "created_at",
            "updated_at",
        ]


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "role",
            "is_verified_provider",
        ]


class PostBookingUserSerializer(serializers.ModelSerializer):
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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "email",
            "phone_number",
            "password",
            "first_name",
            "last_name",
            "role",
        ]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ProviderProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProviderProfile
        fields = [
            "user",
            "certificates",
            "service_areas",
            "languages_known",
            "is_available",
            "availability_schedule",
            "skills",
            "experience_years",
            "hourly_rate",
            "documents",
            "verification_status",
            "city",
            "rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["verification_status", "rating", "created_at", "updated_at"]


class ProviderProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    phone_number = serializers.CharField(max_length=20)
    skills = serializers.ListField(child=serializers.CharField(max_length=120), allow_empty=True, required=False)
    experience_years = serializers.IntegerField(min_value=1)
    certificates = serializers.ListField(child=serializers.CharField(max_length=200), allow_empty=True, required=False)
    service_areas = serializers.ListField(child=serializers.CharField(max_length=120), allow_empty=True, required=False)
    languages_known = serializers.ListField(child=serializers.CharField(max_length=80), allow_empty=True, required=False)
    is_available = serializers.BooleanField(required=False)
    availability_schedule = serializers.ListField(child=serializers.DictField(), required=False)

    def validate_phone_number(self, value):
        phone = (value or "").strip()
        if not phone.isdigit() or len(phone) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return phone

    def validate_full_name(self, value):
        full_name = (value or "").strip()
        if not full_name:
            raise serializers.ValidationError("Full name is required.")
        if len(full_name.split()) < 2:
            raise serializers.ValidationError("Please enter first name and last name.")
        return full_name

    def validate(self, attrs):
        if attrs.get("experience_years", 0) <= 0:
            raise serializers.ValidationError({"experience_years": "Experience must be a positive number."})
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        profile = getattr(user, "provider_profile", None)
        if not profile:
            profile = ProviderProfile.objects.create(user=user)

        full_name = self.validated_data["full_name"].strip()
        name_parts = full_name.split()
        first_name = name_parts[0]
        last_name = " ".join(name_parts[1:])

        user.first_name = first_name
        user.last_name = last_name
        user.phone_number = self.validated_data["phone_number"].strip()
        user.save(update_fields=["first_name", "last_name", "phone_number"])

        profile.skills = self.validated_data.get("skills", [])
        profile.experience_years = self.validated_data["experience_years"]
        profile.certificates = self.validated_data.get("certificates", [])
        profile.service_areas = self.validated_data.get("service_areas", [])
        profile.languages_known = self.validated_data.get("languages_known", [])
        profile.is_available = self.validated_data.get("is_available", profile.is_available)
        profile.availability_schedule = self.validated_data.get("availability_schedule", profile.availability_schedule)
        profile.save(
            update_fields=[
                "skills",
                "experience_years",
                "certificates",
                "service_areas",
                "languages_known",
                "is_available",
                "availability_schedule",
                "updated_at",
            ]
        )
        return profile


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number", "email"]

    def validate_phone_number(self, value):
        phone = (value or "").strip()
        if len(phone) < 8:
            raise serializers.ValidationError("Phone number must be at least 8 digits.")
        return phone


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")
        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        validate_password(new_password, user=self.context["request"].user)
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
