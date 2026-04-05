from datetime import date, timedelta
from decimal import Decimal
from random import choice, randint, uniform

from django.core.management.base import BaseCommand
from faker import Faker

from accounts.models import ProviderProfile, User
from bookings.models import Booking
from reviews.models import Review
from services.models import Category, Service
from services.service_catalog import CATEGORY_SERVICE_CATALOG

faker = Faker()

RATING_BASELINE_BY_CATEGORY = {
    "HOME SERVICES": 4.2,
    "CLEANING SERVICES": 4.8,
    "TECHNICAL SERVICES": 4.4,
    "DELIVERY & ERRANDS": 4.1,
    "EDUCATION": 4.3,
    "BEAUTY & SALON": 4.5,
    "FITNESS": 4.2,
    "EVENT SERVICES": 4.4,
    "PERSONAL CARE": 4.3,
    "PET SERVICES": 4.1,
    "PROFESSIONAL SERVICES": 4.2,
    "ODD JOBS": 3.9,
    "AUTOMOBILE": 4.6,
    "FOOD SERVICES": 4.4,
}


def build_service_description(category_name: str, title: str) -> str:
    template = CATEGORY_SERVICE_CATALOG[category_name]["description_template"]
    return template.format(title=title, title_lower=title.lower())


def build_service_price(category_name: str, index: int) -> Decimal:
    category_data = CATEGORY_SERVICE_CATALOG[category_name]
    amount = category_data["price_start"] + (category_data["price_step"] * index)
    return Decimal(str(amount)).quantize(Decimal("0.01"))


class Command(BaseCommand):
    help = "Seed sample data for Sahāy platform"

    def handle(self, *args, **options):
        category_map = {}
        for category_name in CATEGORY_SERVICE_CATALOG.keys():
            category, _ = Category.objects.get_or_create(name=category_name, defaults={"is_active": True})
            category_map[category_name] = category

        providers = []
        for idx in range(10):
            email = f"provider{idx + 1}@sahay.test"
            provider, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "phone_number": f"9000000{idx:03d}",
                    "first_name": faker.first_name(),
                    "last_name": faker.last_name(),
                    "role": User.Role.PROVIDER,
                    "is_verified_provider": True,
                },
            )
            provider.set_password("Password@123")
            provider.save()
            profile, _ = ProviderProfile.objects.get_or_create(user=provider)
            profile.skills = ["general service"]
            profile.experience_years = randint(1, 12)
            profile.hourly_rate = Decimal(str(round(uniform(200, 1500), 2)))
            profile.verification_status = ProviderProfile.VerificationStatus.APPROVED
            profile.save()
            providers.append(provider)

        customers = []
        for idx in range(20):
            email = f"customer{idx + 1}@sahay.test"
            customer, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "phone_number": f"8000000{idx:03d}",
                    "first_name": faker.first_name(),
                    "last_name": faker.last_name(),
                    "role": User.Role.CUSTOMER,
                },
            )
            customer.set_password("Password@123")
            customer.save()
            customers.append(customer)

        services = []
        for category_name, category_data in CATEGORY_SERVICE_CATALOG.items():
            category = category_map[category_name]
            for index, service_title in enumerate(category_data["services"]):
                service, _ = Service.objects.update_or_create(
                    category=category,
                    title=service_title,
                    defaults={
                        "description": build_service_description(category_name, service_title),
                        "base_price": build_service_price(category_name, index),
                        "is_active": True,
                    },
                )
                services.append(service)

        for _ in range(30):
            service = choice(services)
            total = Decimal(str(round(uniform(500, 3500), 2)))
            commission = (total * Decimal("0.10")).quantize(Decimal("0.01"))
            status = choice([x[0] for x in Booking.Status.choices])
            booking, _ = Booking.objects.get_or_create(
                customer=choice(customers),
                provider=choice(providers),
                service=service,
                scheduled_date=date.today() + timedelta(days=randint(1, 10)),
                scheduled_time=faker.time_object(),
                defaults={
                    "status": status,
                    "total_price": total,
                    "commission_amount": commission,
                    "final_provider_amount": total - commission,
                },
            )

            if booking.status == Booking.Status.COMPLETED:
                baseline = RATING_BASELINE_BY_CATEGORY.get(service.category.name, 4.2)
                generated_rating = int(round(max(1, min(5, uniform(baseline - 0.6, baseline + 0.4)))))
                Review.objects.get_or_create(
                    booking=booking,
                    defaults={
                        "rating": generated_rating,
                        "comment": faker.sentence(nb_words=10),
                    },
                )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
