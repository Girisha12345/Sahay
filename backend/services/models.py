from django.db import models


class Category(models.Model):
	name = models.CharField(max_length=120, unique=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name


class Service(models.Model):
	category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="services")
	title = models.CharField(max_length=150)
	description = models.TextField()
	base_price = models.DecimalField(max_digits=10, decimal_places=2)
	rating = models.FloatField(default=0)
	total_reviews = models.IntegerField(default=0)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.title

	@property
	def average_rating(self):
		if not self.total_reviews:
			return 0
		return round(float(self.rating or 0), 1)

	@property
	def review_count(self):
		return self.total_reviews
