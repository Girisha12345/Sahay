import hashlib
import hmac
import uuid
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from bookings.models import Booking
from payments.models import Payment
from payments.permissions import IsCustomerOrAdmin
from payments.serializers import (
	PaymentOrderCreateSerializer,
	PaymentSerializer,
	PaymentVerifySerializer,
)
from payments.utils import calculate_commission
from notifications.models import Notification
from notifications.services import create_notification


class PaymentCreateOrderView(APIView):
	permission_classes = [IsCustomerOrAdmin]

	def post(self, request):
		serializer = PaymentOrderCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		booking = Booking.objects.filter(id=serializer.validated_data["booking_id"]).first()
		if not booking:
			return Response({"detail": "Booking not found."}, status=404)
		if request.user.role == User.Role.CUSTOMER and booking.customer_id != request.user.id:
			return Response({"detail": "Cannot pay for this booking."}, status=403)
		if booking.status == Booking.Status.CANCELLED:
			return Response({"detail": "Cancelled booking cannot be paid."}, status=400)

		payment_method = booking.payment_method
		commission, provider_amount = calculate_commission(booking.total_price)
		if payment_method == Booking.PaymentMethod.CASH:
			payment, _ = Payment.objects.get_or_create(
				booking=booking,
				defaults={
					"amount": booking.total_price,
					"commission": commission,
					"payment_method": payment_method,
					"payment_status": Payment.PaymentStatus.INITIATED,
					"transaction_id": f"cash_{booking.id}",
				},
			)
			booking.status = Booking.Status.PENDING_PAYMENT
			booking.save(update_fields=["status", "updated_at"])
			return Response(
				{
					"order_id": f"cash_order_{booking.id}",
					"payment_key": "cash",
					"mode": "cash",
					"payment": PaymentSerializer(payment).data,
				},
				status=status.HTTP_201_CREATED,
			)

		order_id = f"order_{uuid.uuid4().hex[:20]}"
		payment_key = settings.RAZORPAY_KEY_ID or "mock_key_local"

		payment, _ = Payment.objects.get_or_create(
			booking=booking,
			defaults={
				"amount": booking.total_price,
				"commission": commission,
				"payment_method": payment_method,
				"transaction_id": order_id,
			},
		)
		payment.transaction_id = order_id
		payment.payment_method = payment_method
		payment.amount = booking.total_price
		payment.commission = commission
		payment.payment_status = Payment.PaymentStatus.INITIATED
		payment.save(update_fields=["transaction_id", "payment_method", "amount", "commission", "payment_status"])

		return Response(
			{
				"order_id": order_id,
				"payment_key": payment_key,
				"amount": str(booking.total_price),
				"currency": "INR",
				"mode": "online",
				"payment": PaymentSerializer(payment).data,
			},
			status=status.HTTP_201_CREATED,
		)


class PaymentVerifyView(APIView):
	permission_classes = [IsCustomerOrAdmin]

	def post(self, request):
		serializer = PaymentVerifySerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		booking = Booking.objects.filter(id=serializer.validated_data["booking_id"]).first()
		if not booking:
			return Response({"detail": "Booking not found."}, status=404)
		if request.user.role == User.Role.CUSTOMER and booking.customer_id != request.user.id:
			return Response({"detail": "Cannot verify payment for this booking."}, status=403)

		payment = Payment.objects.filter(booking=booking).first()
		if not payment:
			return Response({"detail": "Payment record not found."}, status=404)

		is_cash = booking.payment_method == Booking.PaymentMethod.CASH
		if is_cash:
			payment.payment_status = Payment.PaymentStatus.INITIATED
			payment.transaction_id = serializer.validated_data["payment_id"]
			payment.save(update_fields=["payment_status", "transaction_id"])
			booking.status = Booking.Status.PENDING_PAYMENT
			booking.save(update_fields=["status", "updated_at"])
			create_notification(
				user=booking.customer,
				title="Cash booking confirmed",
				message=f"Your cash booking for {booking.service.title} is confirmed and pending payment.",
				notification_type=Notification.NotificationType.PAYMENT_SUCCESS,
				payload={"booking_id": booking.id, "payment_method": booking.payment_method},
			)
			return Response(
				{
					"detail": "Booking confirmed with cash on service.",
					"booking_status": booking.status,
					"payment": PaymentSerializer(payment).data,
				},
				status=status.HTTP_200_OK,
			)

		secret = settings.RAZORPAY_KEY_SECRET or ""
		provided_signature = serializer.validated_data.get("signature", "")
		if secret and provided_signature:
			payload = f"{serializer.validated_data['order_id']}|{serializer.validated_data['payment_id']}"
			expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
			if expected != provided_signature:
				payment.payment_status = Payment.PaymentStatus.FAILED
				payment.save(update_fields=["payment_status"])
				return Response({"detail": "Invalid payment signature."}, status=400)

		payment.payment_status = Payment.PaymentStatus.PAID
		payment.transaction_id = serializer.validated_data["payment_id"]
		payment.provider_released_at = timezone.now() if booking.status == Booking.Status.COMPLETED else None
		payment.save(update_fields=["payment_status", "transaction_id", "provider_released_at"])

		booking.status = Booking.Status.CONFIRMED
		booking.save(update_fields=["status", "updated_at"])
		create_notification(
			user=booking.customer,
			title="Payment successful",
			message=f"Payment for booking #{booking.id} succeeded.",
			notification_type=Notification.NotificationType.PAYMENT_SUCCESS,
			payload={"booking_id": booking.id, "payment_id": payment.id},
		)
		create_notification(
			user=booking.provider,
			title="New paid booking",
			message=f"Booking #{booking.id} has been paid and is ready to start.",
			notification_type=Notification.NotificationType.PAYMENT_SUCCESS,
			payload={"booking_id": booking.id, "payment_id": payment.id},
		)

		return Response(
			{
				"detail": "Payment verified successfully.",
				"booking_status": booking.status,
				"payment": PaymentSerializer(payment).data,
			},
			status=status.HTTP_200_OK,
		)


class PaymentHistoryView(generics.ListAPIView):
	serializer_class = PaymentSerializer

	def get_queryset(self):
		if self.request.user.role == User.Role.ADMIN:
			return Payment.objects.select_related("booking").all().order_by("-created_at")
		return Payment.objects.select_related("booking").filter(
			booking__customer=self.request.user
		).order_by("-created_at")
