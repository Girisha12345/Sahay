from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import ProviderProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	ordering = ("-created_at",)
	list_display = ("email", "phone_number", "role", "is_verified_provider", "is_staff")
	list_filter = ("role", "is_verified_provider", "is_staff")
	fieldsets = (
		(None, {"fields": ("email", "password")}),
		(
			"Personal info",
			{"fields": ("phone_number", "first_name", "last_name", "role", "is_verified_provider")},
		),
		("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
		("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
	)
	readonly_fields = ("created_at", "updated_at", "last_login")
	add_fieldsets = (
		(
			None,
			{
				"classes": ("wide",),
				"fields": ("email", "phone_number", "password1", "password2", "role"),
			},
		),
	)
	search_fields = ("email", "phone_number")


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
	list_display = ("user", "verification_status", "rating", "updated_at")
	list_filter = ("verification_status",)
	search_fields = ("user__email", "user__phone_number")
