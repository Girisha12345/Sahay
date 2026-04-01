from django.db.models.signals import post_migrate
from django.dispatch import receiver

from services.models import Category

DEFAULT_CATEGORIES = [
    "HOME SERVICES",
    "CLEANING SERVICES",
    "TECHNICAL SERVICES",
    "DELIVERY & ERRANDS",
    "PERSONAL CARE",
    "EDUCATION",
    "AUTOMOBILE",
    "FITNESS",
    "EVENT SERVICES",
    "BEAUTY & SALON",
    "PROFESSIONAL SERVICES",
    "ODD JOBS",
    "PET SERVICES",
    "FOOD SERVICES",
]


@receiver(post_migrate)
def create_default_categories(sender, **kwargs):
    if sender.name != "services":
        return
    for category_name in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(name=category_name)
