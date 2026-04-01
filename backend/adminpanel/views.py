from django.db.models import Count, Sum
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ProviderProfile, User
from accounts.permissions import IsAdminRole
from accounts.serializers import ProviderProfileSerializer
from adminpanel.serializers import ApproveProviderSerializer, FlaggedMessageSerializer
from chat.models import Message
from payments.models import Payment


class RevenueAnalyticsView(APIView):
	permission_classes = [IsAdminRole]

	def get(self, request):
		totals = Payment.objects.filter(payment_status__in=["PAID", "RELEASED"]).aggregate(
			revenue=Sum("commission"),
			gross=Sum("amount"),
		)
		by_status = Payment.objects.values("payment_status").annotate(total=Count("id"))
		return Response({"totals": totals, "payment_status": by_status})


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
