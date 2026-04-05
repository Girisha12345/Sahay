from django.db.models import Count
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import ProviderProfile, User
from accounts.permissions import IsProviderRole
from accounts.serializers import (
	LoginSerializer,
	ProviderProfileSerializer,
	RegisterSerializer,
	UserProfileUpdateSerializer,
	UserSerializer,
)
from bookings.models import Booking


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data, context={"request": request})
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data["user"]
		refresh = RefreshToken.for_user(user)
		return Response(
			{
				"access": str(refresh.access_token),
				"refresh": str(refresh),
				"user": UserSerializer(user).data,
			}
		)


class LogoutView(APIView):
	def post(self, request):
		refresh_token = request.data.get("refresh")
		if not refresh_token:
			return Response({"detail": "Refresh token is required."}, status=400)
		token = RefreshToken(refresh_token)
		token.blacklist()
		return Response({"detail": "Logged out successfully."})


class ProfileView(APIView):
	def get(self, request):
		return Response(UserSerializer(request.user).data)


class ProfileUpdateView(APIView):
	def patch(self, request):
		serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(UserSerializer(request.user).data)


class ProviderApplyView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		if request.user.role != User.Role.PROVIDER:
			return Response({"detail": "Only provider accounts can apply."}, status=403)
		profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
		serializer = ProviderProfileSerializer(profile, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save(user=request.user)
		return Response(serializer.data, status=201)


class ProviderDashboardView(APIView):
	permission_classes = [IsProviderRole]

	def get(self, request):
		profile = getattr(request.user, "provider_profile", None)
		if not profile:
			return Response({"detail": "Provider profile not found."}, status=404)

		booking_stats = (
			Booking.objects.filter(provider=request.user)
			.values("status")
			.annotate(total=Count("id"))
		)
		return Response(
			{
				"profile": ProviderProfileSerializer(profile).data,
				"bookings": booking_stats,
			}
		)


class ProviderUpdateProfileView(APIView):
	permission_classes = [IsProviderRole]

	def patch(self, request):
		profile = getattr(request.user, "provider_profile", None)
		if not profile:
			return Response({"detail": "Provider profile not found."}, status=404)
		serializer = ProviderProfileSerializer(profile, data=request.data, partial=True)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)
