from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("services", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="service",
            name="rating",
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name="service",
            name="total_reviews",
            field=models.IntegerField(default=0),
        ),
    ]
