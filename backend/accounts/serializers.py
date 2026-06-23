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
            "identity_documents",
            "bank_details",
            "service_areas",
            "languages_known",
            "skills",
            "experience_years",
            "hourly_rate",
            "documents",
            "is_available",
            "availability_schedule",
            "onboarding_step",
            "onboarding_completed",
            "verification_status",
            "city",
            "rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["verification_status", "rating", "created_at", "updated_at"]


class ProviderOnboardingSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    skills = serializers.ListField(child=serializers.CharField(max_length=120), allow_empty=True, required=False)
    experience_years = serializers.IntegerField(min_value=0, required=False)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    languages_known = serializers.ListField(child=serializers.CharField(max_length=80), allow_empty=True, required=False)
    certificates = serializers.ListField(child=serializers.CharField(max_length=500), allow_empty=True, required=False)
    identity_documents = serializers.ListField(child=serializers.CharField(max_length=500), allow_empty=True, required=False)
    bank_details = serializers.JSONField(required=False)
    onboarding_step = serializers.IntegerField(min_value=1, max_value=6, required=False)
    submit = serializers.BooleanField(required=False, default=False)

    def validate_phone_number(self, value):
        phone = (value or "").strip()
        if phone and (not phone.isdigit() or len(phone) != 10):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return phone

    def validate_full_name(self, value):
        full_name = (value or "").strip()
        if full_name and len(full_name.split()) < 2:
            raise serializers.ValidationError("Please enter first name and last name.")
        return full_name

    def validate(self, attrs):
        if "experience_years" in attrs and attrs["experience_years"] < 0:
            raise serializers.ValidationError({"experience_years": "Experience cannot be negative."})
        if attrs.get("submit"):
            missing = []
            required_pairs = {
                "full_name": "Full name is required to submit onboarding.",
                "phone_number": "Phone number is required to submit onboarding.",
                "skills": "At least one skill is required to submit onboarding.",
                "experience_years": "Experience is required to submit onboarding.",
                "city": "Service city is required to submit onboarding.",
                "languages_known": "At least one language is required to submit onboarding.",
                "bank_details": "Bank details are required to submit onboarding.",
            }
            for field, message in required_pairs.items():
                value = attrs.get(field)
                if field == "experience_years":
                    if value is None or value <= 0:
                        missing.append(message)
                elif field == "bank_details":
                    if not isinstance(value, dict) or not value.get("account_number") or not value.get("ifsc_code"):
                        missing.append(message)
                elif isinstance(value, list):
                    if not value:
                        missing.append(message)
                elif not value or not str(value).strip():
                    missing.append(message)

            if missing:
                raise serializers.ValidationError({"submit": missing})
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        profile = getattr(user, "provider_profile", None)
        if not profile:
            profile = ProviderProfile.objects.create(user=user)

        update_fields = []

        full_name = self.validated_data.get("full_name", "").strip()
        if full_name:
            name_parts = full_name.split()
            user.first_name = name_parts[0]
            user.last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else name_parts[0]
            update_fields.extend(["first_name", "last_name"])

        phone_number = self.validated_data.get("phone_number", "").strip()
        if phone_number:
            user.phone_number = phone_number
            update_fields.append("phone_number")

        if update_fields:
            user.save(update_fields=update_fields)

        if "skills" in self.validated_data:
            profile.skills = self.validated_data["skills"]
        if "experience_years" in self.validated_data:
            profile.experience_years = self.validated_data["experience_years"]
        if "city" in self.validated_data:
            profile.city = self.validated_data["city"].strip()
            profile.service_areas = [profile.city] if profile.city else []
        if "languages_known" in self.validated_data:
            profile.languages_known = self.validated_data["languages_known"]
        if "certificates" in self.validated_data:
            profile.certificates = self.validated_data["certificates"]
        if "identity_documents" in self.validated_data:
            profile.identity_documents = self.validated_data["identity_documents"]
        if "bank_details" in self.validated_data:
            profile.bank_details = self.validated_data["bank_details"]
        if "onboarding_step" in self.validated_data:
            profile.onboarding_step = self.validated_data["onboarding_step"]

        if self.validated_data.get("submit"):
            profile.onboarding_completed = True
            profile.verification_status = ProviderProfile.VerificationStatus.PENDING

        profile.save()
        return profile


class ProviderProfileUpdateSerializer(ProviderOnboardingSerializer):
    pass


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
