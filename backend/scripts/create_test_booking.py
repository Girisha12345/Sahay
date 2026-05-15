from datetime import date, time

from django.contrib.auth import get_user_model

from services.models import Category, Service
from bookings.models import Booking

User = get_user_model()

def run():
    # create users
    customer, _ = User.objects.get_or_create(
        email="testcust@example.com",
        defaults={
            "phone_number": "9999999990",
            "first_name": "Test",
            "last_name": "Customer",
            "role": User.Role.CUSTOMER,
        },
    )
    customer.set_password("Password123!")
    customer.save()

    provider, _ = User.objects.get_or_create(
        email="testprov@example.com",
        defaults={
            "phone_number": "9999999991",
            "first_name": "Test",
            "last_name": "Provider",
            "role": User.Role.PROVIDER,
        },
    )
    provider.set_password("Password123!")
    provider.save()

    # create category and service
    cat, _ = Category.objects.get_or_create(name="SmokeTestCat")
    svc, _ = Service.objects.get_or_create(
        category=cat,
        provider=provider,
        title="Smoke Test Service",
        defaults={
            "description": "Service for smoke testing",
            "base_price": 100,
            "duration_minutes": 60,
        },
    )

    # create booking
    booking = Booking.objects.create(
        customer=customer,
        provider=provider,
        service=svc,
        full_name="Test Customer",
        phone="9999999990",
        address_line="123 Test St",
        area="Test Area",
        city="Test City",
        scheduled_date=date.today(),
        scheduled_time=time(hour=9, minute=0),
        address="123 Test St",
        locality="Test Locality",
        pincode="000000",
        notes="",
        payment_method=Booking.PaymentMethod.CASH,
        total_price=100,
        commission_amount=10,
        final_provider_amount=90,
    )

    print("CREATED_BOOKING", booking.id)

if __name__ == '__main__':
    run()
