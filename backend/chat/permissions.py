from rest_framework.permissions import BasePermission

from chat.models import ChatRoom


class IsChatParticipant(BasePermission):
    def has_permission(self, request, view):
        booking_id = view.kwargs.get("booking_id") or request.data.get("booking_id") or request.query_params.get("booking_id")
        if not booking_id:
            return False
        room = ChatRoom.objects.filter(booking_id=booking_id).select_related("booking").first()
        if not room:
            return False
        booking = room.booking
        return request.user.id in [booking.customer_id, booking.provider_id]
