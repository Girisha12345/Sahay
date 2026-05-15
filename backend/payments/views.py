import hashlib
import hmac
import uuid
from decimal import Decimal

import stripe
from django.conf import settings
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsProviderRole
from bookings.models import Booking
from payments.models import Payment, ProviderWallet, WalletTransaction
from payments.permissions import IsCustomerOrAdmin, IsCustomerProviderOrAdmin
from payments.serializers import (
	PaymentIntentSerializer,
	PaymentOrderCreateSerializer,
	PaymentSerializer,
	PaymentVerifySerializer,
	ProviderWalletSerializer,
	StripeIntentSerializer,
	WalletTransactionSerializer,
)
from payments.utils import calculate_commission
from notifications.models import Notification
from notifications.services import create_notification
from support.permissions import IsSupportAgentOrAdmin

stripe.api_key = settings.STRIPE_SECRET_KEY


def credit_provider_wallet_for_payment(payment: Payment):
	booking = payment.booking
	wallet, _ = ProviderWallet.objects.get_or_create(provider=booking.provider)
	already_credited = wallet.transactions.filter(booking=booking, tx_type=WalletTransaction.TxType.CREDIT).exists()
	if already_credited:
		return wallet

	wallet.total_earned = Decimal(wallet.total_earned) + Decimal(booking.final_provider_amount)
	wallet.total_commission_deducted = Decimal(wallet.total_commission_deducted) + Decimal(booking.commission_amount)
	wallet.pending_payout = Decimal(wallet.pending_payout) + Decimal(booking.final_provider_amount)
	wallet.save(update_fields=["total_earned", "total_commission_deducted", "pending_payout", "updated_at"])
	WalletTransaction.objects.create(
		wallet=wallet,
		booking=booking,
		tx_type=WalletTransaction.TxType.CREDIT,
		amount=booking.final_provider_amount,
		commission_deducted=booking.commission_amount,
		description=f"Payment received for Booking #{booking.id}",
	)
	return wallet


class PaymentHistoryPagination(PageNumberPagination):
	# Keep backward compatibility (list response) unless page_size is explicitly requested.
	page_size = None
	page_size_query_param = "page_size"
	max_page_size = 100


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


class StripeIntentView(APIView):
	permission_classes = [IsCustomerOrAdmin]

	def post(self, request):
		serializer = StripeIntentSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		booking = Booking.objects.filter(id=serializer.validated_data["booking_id"]).first()
		if not booking:
			return Response({"detail": "Booking not found."}, status=404)
		if request.user.role == User.Role.CUSTOMER and booking.customer_id != request.user.id:
			return Response({"detail": "Cannot pay for this booking."}, status=403)
		if booking.status not in {Booking.Status.ACCEPTED, Booking.Status.CONFIRMED, Booking.Status.PENDING_PAYMENT}:
			return Response({"detail": "Stripe payments are available after provider acceptance."}, status=400)
		if not settings.STRIPE_SECRET_KEY:
			return Response({"detail": "Stripe is not configured."}, status=400)

		commission, _ = calculate_commission(booking.total_price)
		payment, _ = Payment.objects.get_or_create(
			booking=booking,
			defaults={
				"amount": booking.total_price,
				"commission": commission,
				"payment_method": "stripe",
				"transaction_id": "",
			},
		)
		payment.amount = booking.total_price
		payment.commission = commission
		payment.payment_method = "stripe"
		payment.payment_status = Payment.PaymentStatus.INITIATED
		payment.save(update_fields=["amount", "commission", "payment_method", "payment_status"])

		intent = stripe.PaymentIntent.create(
			amount=int(Decimal(booking.total_price) * 100),
			currency="inr",
			automatic_payment_methods={"enabled": True},
			metadata={"booking_id": str(booking.id), "payment_id": str(payment.id)},
		)
		payment.transaction_id = intent.id
		payment.save(update_fields=["transaction_id"])

		return Response(
			{
				"client_secret": intent.client_secret,
				"publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
				"payment_intent_id": intent.id,
				"payment": PaymentSerializer(payment).data,
			},
			status=status.HTTP_201_CREATED,
		)


class PaymentIntentCreateView(StripeIntentView):
	permission_classes = [IsCustomerOrAdmin]

	def post(self, request):
		serializer = PaymentIntentSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		request_data = dict(request.data)
		request_data["booking_id"] = serializer.validated_data["booking_id"]
		serializer = StripeIntentSerializer(data=request_data)
		serializer.is_valid(raise_exception=True)

		booking = Booking.objects.filter(id=serializer.validated_data["booking_id"]).first()
		if not booking:
			return Response({"detail": "Booking not found."}, status=404)
		if request.user.role == User.Role.CUSTOMER and booking.customer_id != request.user.id:
			return Response({"detail": "Cannot pay for this booking."}, status=403)
		if booking.status not in {Booking.Status.ACCEPTED, Booking.Status.CONFIRMED, Booking.Status.PENDING_PAYMENT}:
			return Response({"detail": "Stripe payments are available after provider acceptance."}, status=400)
		if not settings.STRIPE_SECRET_KEY:
			return Response({"detail": "Stripe is not configured."}, status=400)

		commission, _ = calculate_commission(booking.total_price)
		payment, _ = Payment.objects.get_or_create(
			booking=booking,
			defaults={
				"amount": booking.total_price,
				"commission": commission,
				"payment_method": "stripe",
				"transaction_id": "",
			},
		)
		payment.amount = booking.total_price
		payment.commission = commission
		payment.payment_method = "stripe"
		payment.payment_status = Payment.PaymentStatus.INITIATED
		payment.save(update_fields=["amount", "commission", "payment_method", "payment_status"])

		intent = stripe.PaymentIntent.create(
			amount=int(Decimal(booking.total_price) * 100),
			currency="inr",
			automatic_payment_methods={"enabled": True},
			metadata={"booking_id": str(booking.id), "payment_id": str(payment.id)},
		)
		payment.transaction_id = intent.id
		payment.save(update_fields=["transaction_id"])

		return Response(
			{
				"client_secret": intent.client_secret,
				"publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
				"payment_intent_id": intent.id,
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
		credit_provider_wallet_for_payment(payment)

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


class PaymentWebhookView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		booking_id = request.data.get("booking_id")
		payment_intent_id = request.data.get("payment_intent_id")
		if not booking_id:
			return Response({"detail": "booking_id is required."}, status=400)

		payment = Payment.objects.filter(booking_id=booking_id).first()
		if not payment:
			return Response({"detail": "Payment record not found."}, status=404)

		payment.payment_status = Payment.PaymentStatus.PAID
		if payment_intent_id:
			payment.transaction_id = payment_intent_id
		payment.save(update_fields=["payment_status", "transaction_id"])
		credit_provider_wallet_for_payment(payment)

		booking = payment.booking
		if booking.status == Booking.Status.PENDING_PAYMENT:
			booking.status = Booking.Status.CONFIRMED
			booking.save(update_fields=["status", "updated_at"])

		return Response({"detail": "Webhook processed."}, status=200)


class ProviderWalletView(APIView):
	permission_classes = [IsProviderRole]

	def get(self, request):
		wallet, _ = ProviderWallet.objects.get_or_create(provider=request.user)

		from django.db.models import Sum
		from django.db.models.functions import TruncWeek
		from django.utils import timezone

		now = timezone.now()
		monthly = WalletTransaction.objects.filter(
			wallet=wallet,
			tx_type=WalletTransaction.TxType.CREDIT,
			created_at__year=now.year,
			created_at__month=now.month,
		).aggregate(total=Sum("amount"))["total"] or 0

		weekly_qs = (
			WalletTransaction.objects
			.filter(wallet=wallet, tx_type=WalletTransaction.TxType.CREDIT)
			.annotate(week=TruncWeek("created_at"))
			.values("week")
			.annotate(total=Sum("amount"))
			.order_by("week")
		)
		weekly_data = [
			{
				"week": item["week"].strftime("W%W") if item["week"] else "",
				"amount": float(item["total"]),
			}
			for item in weekly_qs
		]

		transactions = WalletTransaction.objects.filter(
			wallet=wallet
		).select_related("booking__service", "booking__customer").order_by("-created_at")[:20]

		tx_list = []
		for tx in transactions:
			booking = tx.booking
			service_title = "—"
			customer_name = "—"
			payment_status = "—"
			if booking:
				if getattr(booking, "service", None):
					service_title = booking.service.title
				if getattr(booking, "customer", None):
					customer_name = booking.customer.first_name or "Customer"
				payment = getattr(booking, "payment", None)
				if payment:
					payment_status = payment.payment_status

			tx_list.append({
				"id": tx.id,
				"service": service_title,
				"customer": customer_name,
				"amount": float(tx.amount),
				"date": tx.created_at.strftime("%b %d"),
				"status": payment_status,
				"tx_type": tx.tx_type,
				"description": tx.description,
			})

		return Response({
			"total_earned": float(wallet.total_earned),
			"monthly_earned": float(monthly),
			"pending_payout": float(wallet.pending_payout),
			"total_commission_deducted": float(wallet.total_commission_deducted),
			"weekly_chart": weekly_data,
			"transactions": tx_list,
		})


class RefundView(APIView):
	permission_classes = [IsSupportAgentOrAdmin]

	def post(self, request):
		booking_id = request.data.get("booking_id")
		refund_type = request.data.get("refund_type", "full")
		partial_amount = request.data.get("amount", None)

		if not booking_id:
			return Response({"detail": "booking_id is required."}, status=400)

		payment = Payment.objects.filter(booking_id=booking_id).first()
		if not payment:
			return Response({"detail": "Payment not found for this booking."}, status=404)
		if payment.payment_status == Payment.PaymentStatus.REFUNDED:
			return Response({"detail": "Already refunded."}, status=400)
		if not payment.transaction_id:
			return Response({"detail": "No Stripe transaction on record."}, status=400)

		try:
			if refund_type == "partial" and partial_amount:
				refund = stripe.Refund.create(
					payment_intent=payment.transaction_id,
					amount=int(Decimal(partial_amount) * 100),
				)
			else:
				refund = stripe.Refund.create(payment_intent=payment.transaction_id)

			payment.payment_status = Payment.PaymentStatus.REFUNDED
			payment.save(update_fields=["payment_status"])

			booking = payment.booking
			try:
				wallet = ProviderWallet.objects.get(provider=booking.provider)
				refund_amt = Decimal(partial_amount) if refund_type == "partial" and partial_amount else Decimal(booking.final_provider_amount)
				wallet.total_earned = Decimal(wallet.total_earned) - refund_amt
				wallet.pending_payout = Decimal(wallet.pending_payout) - refund_amt
				wallet.save(update_fields=["total_earned", "pending_payout", "updated_at"])
				WalletTransaction.objects.create(
					wallet=wallet,
					booking=booking,
					tx_type=WalletTransaction.TxType.DEBIT,
					amount=refund_amt,
					description=f"Refund issued for Booking #{booking.id}",
				)
			except ProviderWallet.DoesNotExist:
				pass

			return Response(
				{
					"detail": "Refund processed successfully.",
					"stripe_refund_id": refund.id,
					"status": refund.status,
				}
			)
		except stripe.error.StripeError as e:
			return Response({"detail": str(e)}, status=400)


class PaymentHistoryView(generics.ListAPIView):
	serializer_class = PaymentSerializer
	permission_classes = [IsCustomerProviderOrAdmin]
	filter_backends = [SearchFilter, OrderingFilter]
	search_fields = ["payment_status", "payment_method", "transaction_id"]
	ordering_fields = ["created_at", "amount"]
	ordering = ["-created_at"]
	pagination_class = PaymentHistoryPagination

	@swagger_auto_schema(
		operation_summary="Get payment history",
		operation_description=(
			"Returns payment history for the authenticated user. "
			"Customers see their booking payments, providers see payments for their jobs, and admins see all payments."
		),
		manual_parameters=[
			openapi.Parameter(
				"search",
				openapi.IN_QUERY,
				description="Search by payment_status, payment_method, or transaction_id",
				type=openapi.TYPE_STRING,
			),
			openapi.Parameter(
				"ordering",
				openapi.IN_QUERY,
				description="Order by created_at or amount. Prefix with '-' for descending (e.g. -created_at)",
				type=openapi.TYPE_STRING,
			),
			openapi.Parameter(
				"page",
				openapi.IN_QUERY,
				description="Page number when pagination is enabled",
				type=openapi.TYPE_INTEGER,
			),
			openapi.Parameter(
				"page_size",
				openapi.IN_QUERY,
				description="Enable pagination and limit items per page (max 100)",
				type=openapi.TYPE_INTEGER,
			),
		],
		responses={
			200: PaymentSerializer(many=True),
			401: openapi.Response("Unauthorized - missing or invalid JWT token"),
			403: openapi.Response("Forbidden - user role is not allowed"),
			500: openapi.Response("Internal server error"),
		},
	)
	def get(self, request, *args, **kwargs):
		return super().get(request, *args, **kwargs)

	def get_queryset(self):
		if self.request.user.role == User.Role.ADMIN:
			return Payment.objects.select_related("booking").all().order_by("-created_at")
		if self.request.user.role == User.Role.PROVIDER:
			return Payment.objects.select_related("booking").filter(
				booking__provider=self.request.user
			).order_by("-created_at")
		return Payment.objects.select_related("booking").filter(
			booking__customer=self.request.user
		).order_by("-created_at")
