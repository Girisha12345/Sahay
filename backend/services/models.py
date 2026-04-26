from django.db import models
from django.conf import settings


class Category(models.Model):
	name = models.CharField(max_length=120, unique=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name


class Service(models.Model):
	category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="services")
	provider = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="my_services",
		null=True,
		blank=True,
	)
	title = models.CharField(max_length=150)
	description = models.TextField()
	base_price = models.DecimalField(max_digits=10, decimal_places=2)
	duration_minutes = models.PositiveIntegerField(default=60)
	location = models.CharField(max_length=150, blank=True)
	is_active = models.BooleanField(default=True)
	rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
	total_reviews = models.PositiveIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.title

