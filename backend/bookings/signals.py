from django.db.models.signals import post_save
from django.dispatch import receiver

from bookings.models import Booking
from chat.models import ChatRoom
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from notifications.services import create_notification


@receiver(post_save, sender=Booking)
def create_booking_chat_room(sender, instance, created, **kwargs):
    if created:
        ChatRoom.objects.get_or_create(booking=instance)


@receiver(post_save, sender=Booking)
def broadcast_booking_update(sender, instance, created, **kwargs):
    # Broadcast a booking_update event to both participants via notifications
    channel_layer = get_channel_layer()
    payload = {
        "booking_id": instance.id,
        "status": instance.status,
        "updated_fields": [],
    }

    # send to booking group so chat participants (if connected) receive it
    try:
        async_to_sync(channel_layer.group_send)(
            f"booking_{instance.id}",
            {"type": "booking.update", "event": {"type": "booking_update", "payload": payload}},
        )
    except Exception:
        # non-fatal
        pass

    # create notifications for customer and provider
    try:
        create_notification(
            user=instance.customer,
            title="Booking updated",
            message=f"Booking #{instance.id} status: {instance.status}",
            notification_type="BOOKING_IN_PROGRESS",
            payload=payload,
        )
    except Exception:
        pass

    try:
        create_notification(
            user=instance.provider,
            title="Booking updated",
            message=f"Booking #{instance.id} status: {instance.status}",
            notification_type="BOOKING_IN_PROGRESS",
            payload=payload,
        )
    except Exception:
        pass
