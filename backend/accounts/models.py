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
	full_name = models.CharField(max_length=200, blank=True, default="")
	email_verified = models.BooleanField(default=False)
	phone_verified = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def save(self, *args, **kwargs):
		if self.full_name and not (self.first_name or self.last_name):
			parts = self.full_name.split(maxsplit=1)
			self.first_name = parts[0]
			self.last_name = parts[1] if len(parts) > 1 else ""
		elif (self.first_name or self.last_name) and not self.full_name:
			self.full_name = f"{self.first_name} {self.last_name}".strip()
		super().save(*args, **kwargs)

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
	identity_documents = models.JSONField(default=list, blank=True)
	bank_details = models.JSONField(default=dict, blank=True)
	service_areas = models.JSONField(default=list, blank=True)
	languages_known = models.JSONField(default=list, blank=True)
	is_available = models.BooleanField(default=True)
	availability_schedule = models.JSONField(default=list, blank=True)
	onboarding_step = models.PositiveSmallIntegerField(default=1)
	onboarding_completed = models.BooleanField(default=False)
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


class OTP(models.Model):
	class OTPType(models.TextChoices):
		EMAIL = "EMAIL", "Email Verification"
		PHONE = "PHONE", "Phone Verification"
		PASSWORD_RESET = "PASSWORD_RESET", "Password Reset"

	user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="otps")
	email_or_phone = models.CharField(max_length=255, blank=True, default="")
	otp = models.CharField(max_length=255)
	otp_type = models.CharField(max_length=20, choices=OTPType.choices)
	attempts = models.PositiveIntegerField(default=0)
	expires_at = models.DateTimeField()
	verified = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		target = self.email_or_phone or (self.user.email if self.user else "Anonymous")
		return f"{self.otp_type} OTP for {target} ({self.otp})"
