from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from bookings.models import Booking
from bookings.permissions import IsCustomerCreateOnly
from bookings.serializers import (
	BookingCreateSerializer,
	BookingPaymentMethodUpdateSerializer,
	BookingSerializer,
	BookingStatusUpdateSerializer,
)
from notifications.models import Notification
from notifications.services import create_notification


def get_booking_notification_type(status_value):
	notification_map = {
		Booking.Status.ACCEPTED: Notification.NotificationType.BOOKING_ACCEPTED,
		Booking.Status.IN_PROGRESS: Notification.NotificationType.BOOKING_IN_PROGRESS,
		Booking.Status.COMPLETED: Notification.NotificationType.BOOKING_COMPLETED,
	}
	return notification_map.get(status_value, Notification.NotificationType.BOOKING_CREATED)


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingCreateSerializer
    permission_classes = [IsCustomerCreateOnly]

    def perform_create(self, serializer):
        booking = serializer.save()
        create_notification(
            user=booking.provider,
            title="New booking request",
            message=f"You have a new booking request for {booking.service.title}.",
            notification_type=Notification.NotificationType.BOOKING_CREATED,
            payload={"booking_id": booking.id},
        )
        create_notification(
            user=booking.customer,
            title="Booking created",
            message=f"Your booking for {booking.service.title} has been created.",
            notification_type=Notification.NotificationType.BOOKING_CREATED,
            payload={"booking_id": booking.id},
        )


class CustomerBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(customer=self.request.user).select_related("provider", "service")


class ProviderBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(provider=self.request.user).select_related("customer", "service")


class BookingUpdateStatusView(APIView):
	def patch(self, request):
		booking_id = request.data.get("booking_id")
		if not booking_id:
			return Response({"detail": "booking_id is required."}, status=400)

		try:
			booking = Booking.objects.get(id=booking_id)
		except Booking.DoesNotExist:
			return Response({"detail": "Booking not found."}, status=404)

		is_customer = request.user.role == User.Role.CUSTOMER and booking.customer_id == request.user.id
		is_provider = request.user.role == User.Role.PROVIDER and booking.provider_id == request.user.id
		is_admin = request.user.role == User.Role.ADMIN
		if not (is_customer or is_provider or is_admin):
			return Response({"detail": "Not permitted."}, status=403)

		serializer = BookingStatusUpdateSerializer(booking, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()

		notification_type = get_booking_notification_type(booking.status)
		create_notification(
			user=booking.customer,
			title="Booking status updated",
			message=f"Your booking #{booking.id} is now {booking.status}.",
			notification_type=notification_type,
			payload={"booking_id": booking.id, "status": booking.status},
		)
		create_notification(
			user=booking.provider,
			title="Booking status updated",
			message=f"Booking #{booking.id} is now {booking.status}.",
			notification_type=notification_type,
			payload={"booking_id": booking.id, "status": booking.status},
		)
		return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


class BookingUpdatePaymentMethodView(APIView):
	def patch(self, request):
		booking_id = request.data.get("booking_id")
		if not booking_id:
			return Response({"detail": "booking_id is required."}, status=400)

		try:
			booking = Booking.objects.get(id=booking_id)
		except Booking.DoesNotExist:
			return Response({"detail": "Booking not found."}, status=404)

		if booking.customer_id != request.user.id and request.user.role != User.Role.ADMIN:
			return Response({"detail": "Not permitted."}, status=403)

		serializer = BookingPaymentMethodUpdateSerializer(booking, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)
