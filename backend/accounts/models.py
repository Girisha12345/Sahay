import uuid

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
	def create_user(self, email, phone_number, password=None, **extra_fields):
		if not email:
			raise ValueError("Email is required")
		if not phone_number:
			raise ValueError("Phone number is required")
		email = self.normalize_email(email.strip()).lower()
		user = self.model(email=email, phone_number=phone_number, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, email, phone_number, password=None, **extra_fields):
		extra_fields.setdefault("role", User.Role.ADMIN)
		extra_fields.setdefault("is_staff", True)
		extra_fields.setdefault("is_superuser", True)
		return self.create_user(email, phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
	class Role(models.TextChoices):
		CUSTOMER = "CUSTOMER", "Customer"
		PROVIDER = "PROVIDER", "Provider"
		ADMIN = "ADMIN", "Admin"
		SUPPORT_AGENT = "SUPPORT_AGENT", "Support Agent"

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	email = models.EmailField(unique=True)
	phone_number = models.CharField(max_length=20, unique=True)
	first_name = models.CharField(max_length=100)
	last_name = models.CharField(max_length=100)
	role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
	is_verified_provider = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	is_staff = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	USERNAME_FIELD = "email"
	REQUIRED_FIELDS = ["phone_number"]

	objects = UserManager()

	def __str__(self):
		return f"{self.email} ({self.role})"


class ProviderProfile(models.Model):
	class VerificationStatus(models.TextChoices):
		PENDING = "PENDING", "Pending"
		APPROVED = "APPROVED", "Approved"
		REJECTED = "REJECTED", "Rejected"

	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="provider_profile")
	skills = models.JSONField(default=list, blank=True)
	experience_years = models.PositiveIntegerField(default=0)
	hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	documents = models.JSONField(default=list, blank=True)
	certificates = models.JSONField(default=list, blank=True)
	service_areas = models.JSONField(default=list, blank=True)
	languages_known = models.JSONField(default=list, blank=True)
	verification_status = models.CharField(
		max_length=10,
		choices=VerificationStatus.choices,
		default=VerificationStatus.PENDING,
	)
	city = models.CharField(max_length=100, blank=True, default="")
	rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"ProviderProfile({self.user.email})"
