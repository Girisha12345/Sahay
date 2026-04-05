from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        BOOKING_CREATED = "BOOKING_CREATED", "Booking Created"
        BOOKING_ACCEPTED = "BOOKING_ACCEPTED", "Booking Accepted"
        BOOKING_IN_PROGRESS = "BOOKING_IN_PROGRESS", "Booking In Progress"
        BOOKING_COMPLETED = "BOOKING_COMPLETED", "Booking Completed"
        PAYMENT_SUCCESS = "PAYMENT_SUCCESS", "Payment Success"
        NEW_MESSAGE = "NEW_MESSAGE", "New Message"
        DISPUTE = "DISPUTE", "Dispute"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=120)
    message = models.TextField()
    notification_type = models.CharField(max_length=40, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification({self.user_id}, {self.notification_type})"
