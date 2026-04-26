from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from bookings.models import Booking
from reviews.models import Review
from reviews.serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
	serializer_class = ReviewSerializer
	permission_classes = [IsAuthenticatedOrReadOnly]

	def get_queryset(self):
		queryset = Review.objects.select_related("user", "service", "booking").order_by("-created_at")
		service_id = self.request.query_params.get("service")
		if service_id:
			queryset = queryset.filter(service_id=service_id)
		return queryset

	def create(self, request, *args, **kwargs):
		if not request.user or not request.user.is_authenticated:
			raise PermissionDenied("Authentication required to submit a review.")

		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		booking = serializer.validated_data.get("booking")
		service = serializer.validated_data.get("service")

		if booking:
			if booking.customer_id != request.user.id:
				raise PermissionDenied("Only booking customer can review.")
			if booking.status != Booking.Status.COMPLETED:
				raise ValidationError("Review allowed only for completed bookings.")
			if service and booking.service_id != service.id:
				raise ValidationError("Service does not match booking.")
			service = booking.service

		if not service:
			raise ValidationError("service is required.")

		existing = Review.objects.filter(user=request.user, service=service).first()
		if existing:
			existing.rating = serializer.validated_data["rating"]
			existing.comment = serializer.validated_data.get("comment", "")
			if booking:
				existing.booking = booking
			existing.save()
			return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)

		review = Review.objects.create(
			service=service,
			user=request.user,
			booking=booking,
			rating=serializer.validated_data["rating"],
			comment=serializer.validated_data.get("comment", ""),
		)
		return Response(self.get_serializer(review).data, status=status.HTTP_201_CREATED)

	def update(self, request, *args, **kwargs):
		instance = self.get_object()
		if instance.user_id != request.user.id:
			raise PermissionDenied("You can update only your own review.")
		return super().update(request, *args, **kwargs)

	def partial_update(self, request, *args, **kwargs):
		instance = self.get_object()
		if instance.user_id != request.user.id:
			raise PermissionDenied("You can update only your own review.")
		return super().partial_update(request, *args, **kwargs)

	def destroy(self, request, *args, **kwargs):
		instance = self.get_object()
		if instance.user_id != request.user.id:
			raise PermissionDenied("You can delete only your own review.")
		return super().destroy(request, *args, **kwargs)


class ReviewCreateView(generics.CreateAPIView):
	serializer_class = ReviewSerializer
	permission_classes = [IsAuthenticated]

	def perform_create(self, serializer):
		booking = serializer.validated_data["booking"]
		if booking.customer_id != self.request.user.id:
			raise PermissionDenied("Only booking customer can review.")
		if booking.status != Booking.Status.COMPLETED:
			raise ValidationError("Review allowed only for completed bookings.")
		service = booking.service
		review = Review.objects.filter(user=self.request.user, service=service).first()
		if review:
			review.rating = serializer.validated_data["rating"]
			review.comment = serializer.validated_data.get("comment", "")
			review.booking = booking
			review.save()
			return
		serializer.save(user=self.request.user, service=service)


class ProviderReviewListView(generics.ListAPIView):
	serializer_class = ReviewSerializer
	permission_classes = [AllowAny]

	def get_queryset(self):
		provider_id = self.kwargs["id"]
		return Review.objects.filter(booking__provider_id=provider_id).select_related("booking", "service", "user")
