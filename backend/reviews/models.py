from django.db import models

from accounts.models import User
from bookings.models import Booking
from services.models import Service


class Review(models.Model):
	service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="reviews")
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="service_reviews")
	booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="review", null=True, blank=True)
	rating = models.PositiveSmallIntegerField()
	comment = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.service.title} - {self.rating}*"
