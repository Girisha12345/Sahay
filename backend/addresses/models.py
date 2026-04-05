from django.conf import settings
from django.db import models


class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=80, default="Home Address")
    full_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=15)
    address_line = models.TextField()
    area = models.CharField(max_length=100, blank=True, default="")
    city = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Address({self.user_id}, {self.label})"
