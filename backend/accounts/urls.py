from django.urls import path

from accounts.views import (
    LoginView,
    LogoutView,
    ProfileView,
    ProfileUpdateView,
    RegisterView,
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
]
