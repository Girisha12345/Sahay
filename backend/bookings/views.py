from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from bookings.models import Booking
from bookings.permissions import IsCustomerCreateOnly
from bookings.serializers import (
	BookingCreateSerializer,
	BookingSerializer,
	BookingStatusUpdateSerializer,
)


class BookingCreateView(generics.CreateAPIView):
	serializer_class = BookingCreateSerializer
	permission_classes = [IsCustomerCreateOnly]


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
		return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)
