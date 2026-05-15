from django.db.models import Count, Sum, F, DecimalField, ExpressionWrapper
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ProviderProfile, User
from accounts.permissions import IsAdminRole
from accounts.serializers import ProviderProfileSerializer
from adminpanel.serializers import FlaggedMessageLogSerializer
from bookings.models import Booking
from adminpanel.serializers import ApproveProviderSerializer
from chat.models import FlaggedMessageLog
from payments.models import Payment


class RevenueAnalyticsView(APIView):
	permission_classes = [IsAdminRole]

	def get(self, request):
		from django.db.models.functions import TruncMonth
		from django.utils import timezone

		# Total revenue from paid payments
		total_revenue = Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID).aggregate(total=Sum("amount"))["total"] or 0

		total_bookings = Booking.objects.count()
		completed_bookings = Booking.objects.filter(status=Booking.Status.COMPLETED).count()
		cancelled_bookings = Booking.objects.filter(status=Booking.Status.CANCELLED).count()
		pending_bookings = Booking.objects.filter(status=Booking.Status.PENDING).count()

		monthly_qs = (
			Payment.objects.filter(payment_status=Payment.PaymentStatus.PAID)
			.annotate(month=TruncMonth("created_at"))
			.values("month")
			.annotate(revenue=Sum("amount"))
			.order_by("month")
		)
		monthly_revenue = [
			{
				"month": item["month"].strftime("%b %Y") if item["month"] else "",
				"revenue": float(item["revenue"]),
			}
			for item in monthly_qs
		]

		return Response({
			"total_revenue": float(total_revenue),
			"total_bookings": total_bookings,
			"completed_bookings": completed_bookings,
			"cancelled_bookings": cancelled_bookings,
			"pending_bookings": pending_bookings,
			"monthly_revenue": monthly_revenue,
		})


class PendingProvidersView(APIView):
	permission_classes = [IsAdminRole]

	def get(self, request):
		providers = ProviderProfile.objects.filter(verification_status=ProviderProfile.VerificationStatus.PENDING)
		return Response(ProviderProfileSerializer(providers, many=True).data)


class ApproveProviderView(APIView):
	permission_classes = [IsAdminRole]

	def patch(self, request):
		serializer = ApproveProviderSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		provider = User.objects.filter(id=serializer.validated_data["provider_id"], role=User.Role.PROVIDER).first()
		if not provider:
			return Response({"detail": "Provider not found."}, status=404)

		provider.is_verified_provider = True
		provider.save(update_fields=["is_verified_provider"])
		profile = getattr(provider, "provider_profile", None)
		if profile:
			profile.verification_status = ProviderProfile.VerificationStatus.APPROVED
			profile.save(update_fields=["verification_status"])
		return Response({"detail": "Provider approved."}, status=status.HTTP_200_OK)


class RejectProviderView(APIView):
	permission_classes = [IsAdminRole]

	def patch(self, request):
		serializer = ApproveProviderSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		provider = User.objects.filter(id=serializer.validated_data["provider_id"], role=User.Role.PROVIDER).first()
		if not provider:
			return Response({"detail": "Provider not found."}, status=404)
		profile = getattr(provider, "provider_profile", None)
		if profile:
			profile.verification_status = ProviderProfile.VerificationStatus.REJECTED
			profile.save(update_fields=["verification_status"])
		provider.is_verified_provider = False
		provider.save(update_fields=["is_verified_provider"])
		return Response({"detail": "Provider application rejected."})


class FlaggedChatsView(APIView):
	permission_classes = [IsAdminRole]

	def get(self, request):
		logs = FlaggedMessageLog.objects.select_related(
			"sender", "booking"
		).order_by("-flagged_at")
		return Response(FlaggedMessageLogSerializer(logs, many=True).data)
