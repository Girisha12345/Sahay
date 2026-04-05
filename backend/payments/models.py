from django.db import models

from bookings.models import Booking
from accounts.models import User


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
	payment_method = models.CharField(max_length=20, default="razorpay")
	payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED)
	transaction_id = models.CharField(max_length=255, blank=True)
	provider_released_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Payment#{self.id} - {self.payment_status}"


class Wallet(models.Model):
	provider = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wallet")
	balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Wallet({self.provider_id})"


class WalletTransaction(models.Model):
	class TransactionType(models.TextChoices):
		CREDIT = "CREDIT", "Credit"
		DEBIT = "DEBIT", "Debit"
		ESCROW_RELEASE = "ESCROW_RELEASE", "Escrow Release"
		REFUND = "REFUND", "Refund"

	wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
	amount = models.DecimalField(max_digits=12, decimal_places=2)
	transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
	booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="wallet_transactions")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"WalletTransaction({self.wallet_id}, {self.transaction_type})"
