from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_providerprofile_city"),
    ]

    operations = [
        migrations.AddField(
            model_name="providerprofile",
            name="certificates",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="providerprofile",
            name="service_areas",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="providerprofile",
            name="languages_known",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
