from django.conf import settings
from django.db import migrations, models


def backfill_service_user(apps, schema_editor):
    Review = apps.get_model("reviews", "Review")
    for review in Review.objects.select_related("booking").all():
        booking = review.booking
        if booking:
            review.service_id = booking.service_id
            review.user_id = booking.customer_id
            review.save(update_fields=["service", "user"])


class Migration(migrations.Migration):

    dependencies = [
        ("services", "0002_service_rating_total_reviews"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("reviews", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="review",
            name="service",
            field=models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name="reviews", to="services.service"),
        ),
        migrations.AddField(
            model_name="review",
            name="user",
            field=models.ForeignKey(blank=True, null=True, on_delete=models.CASCADE, related_name="service_reviews", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name="review",
            name="booking",
            field=models.OneToOneField(blank=True, null=True, on_delete=models.CASCADE, related_name="review", to="bookings.booking"),
        ),
        migrations.RunPython(backfill_service_user, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="review",
            name="service",
            field=models.ForeignKey(on_delete=models.CASCADE, related_name="reviews", to="services.service"),
        ),
        migrations.AlterField(
            model_name="review",
            name="user",
            field=models.ForeignKey(on_delete=models.CASCADE, related_name="service_reviews", to=settings.AUTH_USER_MODEL),
        ),
    ]
