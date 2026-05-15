import logging
from django.db import DatabaseError, OperationalError, ProgrammingError

from django.contrib.auth import authenticate
from django.db.models import Count
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import ProviderProfile, User
from accounts.permissions import IsProviderRole
from accounts.serializers import (
	ChangePasswordSerializer,
	LoginSerializer,
	ProviderProfileSerializer,
	ProviderProfileUpdateSerializer,
	RegisterSerializer,
	UserProfileUpdateSerializer,
	UserSerializer,
)
from bookings.models import Booking


logger = logging.getLogger(__name__)


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		try:
			user = serializer.save()
			return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
		except Exception as exc:
			# Log and return a friendly DB/connectivity error if it originated from DB
			logger.exception("Registration failed", exc_info=exc, extra={"path": request.path})
			return Response(
				{"detail": "Server error during registration. Check database connection and migrations."},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]

	@swagger_auto_schema(request_body=LoginSerializer)
	def post(self, request):
		try:
			serializer = LoginSerializer(data=request.data)
			serializer.is_valid(raise_exception=True)
			email = serializer.validated_data["email"].strip().lower()
			password = serializer.validated_data["password"]

			# User model sets USERNAME_FIELD to email, so pass email via username.
			user = authenticate(request=request, username=email, password=password)
			if not user:
				return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
			if not user.is_active:
				return Response({"error": "Account is disabled"}, status=status.HTTP_400_BAD_REQUEST)

			refresh = RefreshToken.for_user(user)
			return Response(
				{
					"access": str(refresh.access_token),
					"refresh": str(refresh),
					"user": UserSerializer(user).data,
				}
			)
		except (DatabaseError, OperationalError, ProgrammingError) as db_err:
			logger.exception("Database error during login", exc_info=db_err, extra={"path": request.path})
			return Response(
				{
					"detail": "Server database error. Ensure the database is configured and migrations have been applied (python manage.py migrate).",
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		except Exception as exc:
			logger.exception("Login failed due to unexpected error", exc_info=exc, extra={"path": request.path})
			return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


class ChangePasswordView(APIView):
	def post(self, request):
		serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response({"detail": "Password changed successfully."})


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
		from payments.models import ProviderWallet

		profile = getattr(request.user, "provider_profile", None)
		bookings = Booking.objects.filter(provider=request.user)

		total_bookings = bookings.count()
		pending_requests = bookings.filter(status=Booking.Status.PENDING).count()
		completed_jobs = bookings.filter(status=Booking.Status.COMPLETED).count()
		in_progress = bookings.filter(status=Booking.Status.IN_PROGRESS).count()

		try:
			wallet = ProviderWallet.objects.get(provider=request.user)
			total_earnings = float(wallet.total_earned)
		except Exception:
			total_earnings = 0.0

		profile_data = {
			"skills": getattr(profile, "skills", []),
			"documents": getattr(profile, "documents", []),
			"verification_status": getattr(profile, "verification_status", "PENDING"),
			"is_available": getattr(profile, "is_available", False),
			"rating": str(getattr(profile, "rating", "0.0")),
			"total_reviews": getattr(profile, "total_reviews", 0),
			"experience_years": getattr(profile, "experience_years", 0),
			"service_areas": getattr(profile, "service_areas", []),
		}

		return Response({
			"profile": profile_data,
			"total_bookings": total_bookings,
			"pending_requests": pending_requests,
			"completed_jobs": completed_jobs,
			"in_progress": in_progress,
			"total_earnings": total_earnings,
		})


class ProviderUpdateProfileView(APIView):
	permission_classes = [IsProviderRole]

	def put(self, request):
		serializer = ProviderProfileUpdateSerializer(data=request.data, context={"request": request})
		serializer.is_valid(raise_exception=True)
		profile = serializer.save()
		return Response(
			{
				"detail": "Provider profile updated successfully.",
				"profile": ProviderProfileSerializer(profile).data,
				"user": UserSerializer(request.user).data,
			}
		)

	def patch(self, request):
		return self.put(request)


class ProviderDeactivateAccountView(APIView):
	permission_classes = [IsProviderRole]

	def post(self, request):
		user = request.user
		profile = getattr(user, "provider_profile", None)

		if profile:
			profile.is_available = False
			profile.save(update_fields=["is_available", "updated_at"])

		user.is_active = False
		user.save(update_fields=["is_active"])

		refresh_token = request.data.get("refresh")
		if refresh_token:
			try:
				RefreshToken(refresh_token).blacklist()
			except Exception:
				logger.exception(
					"Failed to blacklist refresh token during provider deactivation",
					extra={"user_id": str(user.id)},
				)

		return Response(
			{
				"detail": "Your account has been deactivated successfully.",
				"is_active": user.is_active,
			},
			status=status.HTTP_200_OK,
		)


class ProviderAvailabilityView(APIView):
	permission_classes = [IsProviderRole]

	def get(self, request):
		profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
		return Response(
			{
				"is_available": profile.is_available,
				"schedule": profile.availability_schedule or [],
			}
		)

	def post(self, request):
		profile, _ = ProviderProfile.objects.get_or_create(user=request.user)
		profile.is_available = bool(request.data.get("is_available", profile.is_available))
		schedule = request.data.get("schedule", profile.availability_schedule or [])
		profile.availability_schedule = schedule
		profile.save(update_fields=["is_available", "availability_schedule", "updated_at"])
		return Response(
			{
				"detail": "Availability saved successfully.",
				"is_available": profile.is_available,
				"schedule": profile.availability_schedule,
			}
		)
