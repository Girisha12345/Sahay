from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from accounts.models import ProviderProfile
from reviews.models import Review
from services.models import Service


def update_provider_and_service_rating(review: Review):
    service_id = review.service_id

    if review.booking_id:
        provider_id = review.booking.provider_id
        provider_avg_rating = (
            Review.objects.filter(booking__provider_id=provider_id).aggregate(avg=Avg("rating"))["avg"]
            or 0
        )
        ProviderProfile.objects.filter(user_id=provider_id).update(rating=round(provider_avg_rating, 2))

    service_aggregates = Review.objects.filter(service_id=service_id).aggregate(
        avg_rating=Avg("rating"),
        total=Count("id"),
    )
    Service.objects.filter(id=service_id).update(
        rating=round(service_aggregates["avg_rating"] or 0, 2),
        total_reviews=service_aggregates["total"] or 0,
    )


@receiver(post_save, sender=Review)
def update_ratings_on_save(sender, instance, **kwargs):
    update_provider_and_service_rating(instance)


@receiver(post_delete, sender=Review)
def update_ratings_on_delete(sender, instance, **kwargs):
    update_provider_and_service_rating(instance)
