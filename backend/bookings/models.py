from django.db import models

from accounts.models import User
from services.models import Service


class Booking(models.Model):
	class Status(models.TextChoices):
		PENDING = "PENDING", "Pending"
		ACCEPTED = "ACCEPTED", "Accepted"
		IN_PROGRESS = "IN_PROGRESS", "In Progress"
		COMPLETED = "COMPLETED", "Completed"
		CANCELLED = "CANCELLED", "Cancelled"
		DISPUTED = "DISPUTED", "Disputed"

	customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="customer_bookings")
	provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name="provider_bookings")
	service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="bookings")
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	scheduled_date = models.DateField()
	scheduled_time = models.TimeField()
	total_price = models.DecimalField(max_digits=10, decimal_places=2)
	commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
	final_provider_amount = models.DecimalField(max_digits=10, decimal_places=2)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Booking#{self.id} - {self.customer.email}"
