from django.urls import path

from accounts.views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    ProfileUpdateView,
    ProviderDeactivateAccountView,
    RegisterView,
    ProviderAvailabilityView,
)

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("register/", RegisterView.as_view(), name="register-slash"),
    path("login", LoginView.as_view(), name="login"),
    path("login/", LoginView.as_view(), name="login-slash"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("logout/", LogoutView.as_view(), name="logout-slash"),
    path("profile", ProfileView.as_view(), name="profile"),
    path("profile/", ProfileView.as_view(), name="profile-slash"),
    path("profile/update", ProfileUpdateView.as_view(), name="profile-update"),
    path("profile/update/", ProfileUpdateView.as_view(), name="profile-update-slash"),
    path("change-password", ChangePasswordView.as_view(), name="change-password"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password-slash"),
    path("deactivate-account", ProviderDeactivateAccountView.as_view(), name="deactivate-account"),
    path("deactivate-account/", ProviderDeactivateAccountView.as_view(), name="deactivate-account-slash"),
    path("provider/availability", ProviderAvailabilityView.as_view(), name="provider-availability-no-slash"),
    path("provider/availability/", ProviderAvailabilityView.as_view(), name="provider-availability"),
]
