from django.db import models

from accounts.models import User
from services.models import Service


class Booking(models.Model):
	class Status(models.TextChoices):
		PENDING_PAYMENT = "PENDING_PAYMENT", "Pending Payment"
		PENDING = "PENDING", "Pending"
		CONFIRMED = "CONFIRMED", "Confirmed"
		ACCEPTED = "ACCEPTED", "Accepted"
		IN_PROGRESS = "IN_PROGRESS", "In Progress"
		COMPLETED = "COMPLETED", "Completed"
		CANCELLED = "CANCELLED", "Cancelled"
		REFUNDED = "REFUNDED", "Refunded"
		DISPUTED = "DISPUTED", "Disputed"

	class PaymentMethod(models.TextChoices):
		UPI = "upi", "UPI"
		PHONEPE = "phonepe", "PhonePe"
		GOOGLEPAY = "googlepay", "Google Pay"
		RAZORPAY = "razorpay", "Razorpay"
		CASH = "cash", "Cash on Service"

	customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="customer_bookings")
	provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name="provider_bookings")
	service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="bookings")
	full_name = models.CharField(max_length=200, blank=True, default="")
	phone = models.CharField(max_length=15, blank=True, default="")
	address_line = models.TextField(blank=True, default="")
	area = models.CharField(max_length=100, blank=True, default="")
	city = models.CharField(max_length=100, blank=True, default="")
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	scheduled_date = models.DateField()
	scheduled_time = models.TimeField()
	address = models.CharField(max_length=255)
	locality = models.CharField(max_length=120)
	pincode = models.CharField(max_length=10)
	notes = models.TextField(blank=True)
	payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
	total_price = models.DecimalField(max_digits=10, decimal_places=2)
	commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
	final_provider_amount = models.DecimalField(max_digits=10, decimal_places=2)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Booking#{self.id} - {self.customer.email}"
