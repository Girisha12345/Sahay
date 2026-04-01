from django.db.models import Avg
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import ProviderProfile
from reviews.models import Review


@receiver(post_save, sender=Review)
def update_provider_rating(sender, instance, **kwargs):
    provider_id = instance.booking.provider_id
    avg_rating = (
        Review.objects.filter(booking__provider_id=provider_id).aggregate(avg=Avg("rating"))["avg"]
        or 0
    )
    ProviderProfile.objects.filter(user_id=provider_id).update(rating=round(avg_rating, 2))
