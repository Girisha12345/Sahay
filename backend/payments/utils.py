from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from bookings.models import Booking
from payments.models import Payment, Wallet, WalletTransaction

COMMISSION_RATE = Decimal("0.10")


def calculate_commission(total_amount: Decimal) -> tuple[Decimal, Decimal]:
    commission_amount = (Decimal(total_amount) * COMMISSION_RATE).quantize(Decimal("0.01"))
    provider_amount = (Decimal(total_amount) - commission_amount).quantize(Decimal("0.01"))
    return commission_amount, provider_amount


def release_escrow_to_provider(*, booking: Booking) -> WalletTransaction | None:
    payment = getattr(booking, "payment", None)
    if not payment or payment.payment_status != Payment.PaymentStatus.PAID:
        return None

    wallet, _ = Wallet.objects.get_or_create(provider=booking.provider)
    existing = wallet.transactions.filter(booking=booking, transaction_type=WalletTransaction.TransactionType.ESCROW_RELEASE).first()
    if existing:
        return existing

    with transaction.atomic():
        wallet.balance = (wallet.balance + Decimal(payment.amount) - Decimal(payment.commission)).quantize(Decimal("0.01"))
        wallet.save(update_fields=["balance", "updated_at"])
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            amount=(Decimal(payment.amount) - Decimal(payment.commission)).quantize(Decimal("0.01")),
            transaction_type=WalletTransaction.TransactionType.ESCROW_RELEASE,
            booking=booking,
        )
        payment.payment_status = Payment.PaymentStatus.RELEASED
        payment.provider_released_at = timezone.now()
        payment.save(update_fields=["payment_status", "provider_released_at"])
        return tx
