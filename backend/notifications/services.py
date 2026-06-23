import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth.models import AnonymousUser

from notifications.models import Notification
from notifications.serializers import NotificationSerializer


logger = logging.getLogger(__name__)


def create_notification(*, user, title: str, message: str, notification_type: str, payload=None):
    # Do not attempt to create notifications for anonymous or missing users
    if not user or getattr(user, "is_anonymous", False) or getattr(user, "id", None) is None:
        logger.debug("Skipping notification creation for anonymous or invalid user", extra={"user": str(user)})
        return None

    try:
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            payload=payload or {},
        )
    except Exception:
        logger.exception("Failed to create Notification", extra={"user_id": getattr(user, "id", None), "type": notification_type})
        return None

    channel_layer = get_channel_layer()
    if channel_layer and user and getattr(user, "id", None):
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


def notify_admins(*, title: str, message: str, notification_type: str, payload=None):
    from accounts.models import User
    try:
        admins = User.objects.filter(role=User.Role.ADMIN)
        for admin in admins:
            create_notification(
                user=admin,
                title=title,
                message=message,
                notification_type=notification_type,
                payload=payload,
            )
    except Exception:
        logger.exception("Failed to dispatch notifications to admins")
