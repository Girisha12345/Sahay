from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from bookings.models import Booking
from payments.models import Payment

COMMISSION_RATE = Decimal("0.10")


def calculate_commission(total_amount: Decimal) -> tuple[Decimal, Decimal]:
    commission_amount = (Decimal(total_amount) * COMMISSION_RATE).quantize(Decimal("0.01"))
    provider_amount = (Decimal(total_amount) - commission_amount).quantize(Decimal("0.01"))
    return commission_amount, provider_amount


def release_escrow_to_provider(*, booking: Booking):
    payment = getattr(booking, "payment", None)
    if not payment or payment.payment_status != Payment.PaymentStatus.PAID:
        return None

    with transaction.atomic():
        payment.payment_status = Payment.PaymentStatus.RELEASED
        payment.provider_released_at = timezone.now()
        payment.save(update_fields=["payment_status", "provider_released_at"])
        return payment
