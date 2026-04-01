from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError

from bookings.models import Booking
from reviews.models import Review
from reviews.permissions import IsBookingParticipantForReview
from reviews.serializers import ReviewSerializer


class ReviewCreateView(generics.CreateAPIView):
	serializer_class = ReviewSerializer
	permission_classes = [IsBookingParticipantForReview]

	def perform_create(self, serializer):
		booking = serializer.validated_data["booking"]
		if booking.customer_id != self.request.user.id:
			raise PermissionDenied("Only booking customer can review.")
		if booking.status != Booking.Status.COMPLETED:
			raise ValidationError("Review allowed only for completed bookings.")
		serializer.save()


class ProviderReviewListView(generics.ListAPIView):
	serializer_class = ReviewSerializer

	def get_queryset(self):
		provider_id = self.kwargs["id"]
		return Review.objects.filter(booking__provider_id=provider_id).select_related("booking")
