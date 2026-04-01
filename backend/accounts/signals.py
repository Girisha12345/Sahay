from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import ProviderProfile, User


@receiver(post_save, sender=User)
def create_provider_profile(sender, instance, created, **kwargs):
    if created and instance.role == User.Role.PROVIDER:
        ProviderProfile.objects.get_or_create(user=instance)
