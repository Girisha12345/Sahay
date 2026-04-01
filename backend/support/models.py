from django.db import models

from accounts.models import User
from bookings.models import Booking


class SupportTicket(models.Model):
	class Status(models.TextChoices):
		OPEN = "OPEN", "Open"
		IN_REVIEW = "IN_REVIEW", "In Review"
		RESOLVED = "RESOLVED", "Resolved"

	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="support_tickets")
	booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
	subject = models.CharField(max_length=200)
	description = models.TextField()
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Ticket({self.id})"
