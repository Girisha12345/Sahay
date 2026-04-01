from django.db import models

from bookings.models import Booking


class Payment(models.Model):
	class PaymentStatus(models.TextChoices):
		INITIATED = "INITIATED", "Initiated"
		PAID = "PAID", "Paid"
		RELEASED = "RELEASED", "Released"
		FAILED = "FAILED", "Failed"
		REFUNDED = "REFUNDED", "Refunded"

	booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	commission = models.DecimalField(max_digits=10, decimal_places=2)
	payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED)
	transaction_id = models.CharField(max_length=255, blank=True)
	provider_released_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Payment#{self.id} - {self.payment_status}"
