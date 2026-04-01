from decimal import Decimal

import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from bookings.models import Booking
from payments.models import Payment
from payments.permissions import IsCustomerOrAdmin
from payments.serializers import PaymentIntentSerializer, PaymentSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentIntentCreateView(APIView):
	permission_classes = [IsCustomerOrAdmin]

	def post(self, request):
		serializer = PaymentIntentSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		booking = Booking.objects.filter(id=serializer.validated_data["booking_id"]).first()
		if not booking:
			return Response({"detail": "Booking not found."}, status=404)
		if request.user.role == User.Role.CUSTOMER and booking.customer_id != request.user.id:
			return Response({"detail": "Cannot pay for this booking."}, status=403)

		if not settings.STRIPE_SECRET_KEY:
			return Response({"detail": "Stripe key not configured."}, status=500)

		amount_in_paise = int(Decimal(booking.total_price) * 100)
		intent = stripe.PaymentIntent.create(
			amount=amount_in_paise,
			currency="inr",
			metadata={"booking_id": booking.id},
		)

		payment, _ = Payment.objects.get_or_create(
			booking=booking,
			defaults={
				"amount": booking.total_price,
				"commission": booking.commission_amount,
				"transaction_id": intent.id,
			},
		)
		if not payment.transaction_id:
			payment.transaction_id = intent.id
			payment.save(update_fields=["transaction_id"])

		return Response(
			{
				"client_secret": intent.client_secret,
				"payment": PaymentSerializer(payment).data,
			},
			status=status.HTTP_201_CREATED,
		)


class PaymentWebhookView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		payload = request.body
		sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

		try:
			event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
		except Exception:
			return Response({"detail": "Invalid webhook."}, status=400)

		if event["type"] == "payment_intent.succeeded":
			intent = event["data"]["object"]
			transaction_id = intent.get("id")
			payment = Payment.objects.filter(transaction_id=transaction_id).first()
			if payment:
				payment.payment_status = Payment.PaymentStatus.PAID
				if payment.booking.status == Booking.Status.COMPLETED:
					payment.payment_status = Payment.PaymentStatus.RELEASED
					payment.provider_released_at = timezone.now()
				payment.save()

		return Response({"received": True}, status=200)


class PaymentHistoryView(generics.ListAPIView):
	serializer_class = PaymentSerializer

	def get_queryset(self):
		if self.request.user.role == User.Role.ADMIN:
			return Payment.objects.select_related("booking").all().order_by("-created_at")
		return Payment.objects.select_related("booking").filter(
			booking__customer=self.request.user
		).order_by("-created_at")
