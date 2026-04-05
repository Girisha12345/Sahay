import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


logger = logging.getLogger(__name__)


def create_notification(*, user, title: str, message: str, notification_type: str, payload=None):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        payload=payload or {},
    )

    channel_layer = get_channel_layer()
    if channel_layer and user:
        try:
            async_to_sync(channel_layer.group_send)(
                f"notifications_{user.id}",
                {
                    "type": "notification.message",
                    "notification": NotificationSerializer(notification).data,
                },
            )
        except Exception:
            # Real-time push must not break core flows like booking and payment.
            logger.exception("Failed to push notification over channel layer", extra={"user_id": getattr(user, "id", None)})

    return notification
