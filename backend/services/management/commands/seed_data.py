from datetime import date, timedelta
from decimal import Decimal
from random import choice, randint, uniform

from django.core.management.base import BaseCommand
from faker import Faker

from accounts.models import ProviderProfile, User
from bookings.models import Booking
from services.models import Category, Service

faker = Faker()

SERVICE_NAMES = [
    "Emergency Plumbing Repair",
    "Bathroom Pipe Installation",
    "Kitchen Sink Unclogging",
    "Home Electrical Wiring",
    "Ceiling Fan Installation",
    "Switchboard Repair Service",
    "Split AC Installation",
    "AC Deep Cleaning",
    "Refrigerator Repair",
    "Washing Machine Repair",
    "Laptop Hardware Repair",
    "Desktop Setup & Maintenance",
    "WiFi Router Configuration",
    "CCTV Camera Installation",
    "Home Deep Cleaning",
    "Sofa Shampoo Cleaning",
    "Bathroom Sanitization",
    "Kitchen Chimney Cleaning",
    "Pest Control Treatment",
    "Car Interior Detailing",
    "Car Wash At Home",
    "Bike Servicing At Doorstep",
    "Driver On Demand",
    "Packers and Movers Help",
    "Local Delivery Partner",
    "Grocery Pickup Assistance",
    "Elder Care Companion",
    "Baby Sitting Service",
    "Home Nursing Visit",
    "Physiotherapy At Home",
    "Personal Fitness Trainer",
    "Yoga Instructor Session",
    "Zumba Home Class",
    "Math Home Tutor",
    "English Speaking Tutor",
    "Science Coaching Session",
    "Music Teacher At Home",
    "Guitar Beginner Lessons",
    "Bridal Makeup Service",
    "Hair Spa At Home",
    "Men Grooming Service",
    "Mehendi Artist Booking",
    "Event Decoration Setup",
    "Birthday Party Planner",
    "Photography & Videography",
    "Pet Grooming At Home",
    "Pet Walking Service",
    "Home Chef Meal Service",
    "Catering For Small Events",
    "Legal Document Assistance",
]


class Command(BaseCommand):
    help = "Seed sample data for Sahāy platform"

    def handle(self, *args, **options):
        categories = list(Category.objects.all())
        if not categories:
            self.stdout.write(self.style.ERROR("No categories found. Run migrations first."))
            return

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
        for idx, service_name in enumerate(SERVICE_NAMES):
            service = Service.objects.filter(title=service_name).first()
            if not service:
                legacy_service = Service.objects.filter(title=f"Service {idx + 1}").first()
                if legacy_service:
                    legacy_service.title = service_name
                    legacy_service.category = legacy_service.category or choice(categories)
                    if not legacy_service.description:
                        legacy_service.description = faker.sentence(nb_words=12)
                    if not legacy_service.base_price:
                        legacy_service.base_price = Decimal(str(round(uniform(300, 2500), 2)))
                    legacy_service.is_active = True
                    legacy_service.save()
                    service = legacy_service
                else:
                    service = Service.objects.create(
                        title=service_name,
                        category=choice(categories),
                        description=faker.sentence(nb_words=12),
                        base_price=Decimal(str(round(uniform(300, 2500), 2))),
                        is_active=True,
                    )
            services.append(service)

        for _ in range(30):
            service = choice(services)
            total = Decimal(str(round(uniform(500, 3500), 2)))
            commission = (total * Decimal("0.10")).quantize(Decimal("0.01"))
            Booking.objects.get_or_create(
                customer=choice(customers),
                provider=choice(providers),
                service=service,
                scheduled_date=date.today() + timedelta(days=randint(1, 10)),
                scheduled_time=faker.time_object(),
                defaults={
                    "status": choice([x[0] for x in Booking.Status.choices]),
                    "total_price": total,
                    "commission_amount": commission,
                    "final_provider_amount": total - commission,
                },
            )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
