from django.db import models
from django.conf import settings

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
	payment_method = models.CharField(max_length=20, default="razorpay")
	payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED)
	transaction_id = models.CharField(max_length=255, blank=True)
	provider_released_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Payment#{self.id} - {self.payment_status}"


class ProviderWallet(models.Model):
	provider = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
	total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	total_commission_deducted = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	pending_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Wallet({self.provider.email})"


class WalletTransaction(models.Model):
	class TxType(models.TextChoices):
		CREDIT = "CREDIT", "Credit"
		DEBIT = "DEBIT", "Debit"

	wallet = models.ForeignKey(ProviderWallet, on_delete=models.CASCADE, related_name="transactions")
	booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True)
	tx_type = models.CharField(max_length=10, choices=TxType.choices)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	commission_deducted = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	description = models.CharField(max_length=255, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Tx({self.tx_type}, {self.amount})"
