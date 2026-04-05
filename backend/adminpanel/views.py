from django.db.models import Count, Sum, F, DecimalField, ExpressionWrapper
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ProviderProfile, User
from accounts.permissions import IsAdminRole
from accounts.serializers import ProviderProfileSerializer
from bookings.models import Booking
from adminpanel.serializers import ApproveProviderSerializer, FlaggedMessageSerializer
from chat.models import Message
from payments.models import Payment


class RevenueAnalyticsView(APIView):
	permission_classes = [IsAdminRole]

	def get(self, request):
		completed_payments = Payment.objects.filter(payment_status="RELEASED")
		provider_earnings = completed_payments.aggregate(
			total=Sum(ExpressionWrapper(F("amount") - F("commission"), output_field=DecimalField(max_digits=12, decimal_places=2)))
		)["total"] or 0
		totals = completed_payments.aggregate(
			revenue=Sum("amount"),
			commission=Sum("commission"),
			provider_earnings=provider_earnings,
		)
		completed_bookings = Booking.objects.filter(status=Booking.Status.COMPLETED).count()
		by_status = Payment.objects.values("payment_status").annotate(total=Count("id"))
		flagged_messages = Message.objects.filter(is_flagged=True).count()
		return Response(
			{
				"totals": totals,
				"payment_status": by_status,
				"completed_bookings": completed_bookings,
				"flagged_messages": flagged_messages,
			}
		)


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


class FlaggedChatsView(APIView):
	permission_classes = [IsAdminRole]

	def get(self, request):
		messages = Message.objects.filter(is_flagged=True).select_related("sender").order_by("-created_at")
		return Response(FlaggedMessageSerializer(messages, many=True).data)
