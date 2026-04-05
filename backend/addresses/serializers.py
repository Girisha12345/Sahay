from rest_framework import serializers

from addresses.models import Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "full_name",
            "phone_number",
            "address_line",
            "area",
            "city",
            "pin_code",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_phone_number(self, value):
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 8:
            raise serializers.ValidationError("Phone number must be at least 8 digits.")
        return value.strip()

    def validate_pin_code(self, value):
        pin_code = value.strip()
        if len(pin_code) != 6 or not pin_code.isdigit():
            raise serializers.ValidationError("PIN code must be a 6-digit number.")
        return pin_code


class AddressCreateSerializer(AddressSerializer):
    pass
