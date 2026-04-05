from django.db.models.signals import post_save
from django.dispatch import receiver

from bookings.models import Booking
from payments.models import Payment
from payments.utils import release_escrow_to_provider


@receiver(post_save, sender=Booking)
def release_payment_on_completion(sender, instance, **kwargs):
    if instance.status != Booking.Status.COMPLETED:
        return
    payment = getattr(instance, "payment", None)
    if payment and payment.payment_status == Payment.PaymentStatus.PAID:
        release_escrow_to_provider(booking=instance)
