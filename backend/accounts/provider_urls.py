from django.urls import path

from accounts.views import (
    ProviderApplyView,
    ProviderAvailabilityView,
    ProviderDashboardView,
    ProviderDocumentUploadView,
    ProviderOnboardingView,
    ProviderProfileDetailView,
    ProviderUpdateProfileView,
)

urlpatterns = [
    path("provider/apply", ProviderApplyView.as_view(), name="provider-apply"),
    path("provider/dashboard", ProviderDashboardView.as_view(), name="provider-dashboard"),
    path("provider/availability", ProviderAvailabilityView.as_view(), name="provider-availability"),
    path("provider/update-profile", ProviderUpdateProfileView.as_view(), name="provider-update-profile"),
    path("providers/profile/update/", ProviderUpdateProfileView.as_view(), name="providers-profile-update"),
    path("provider/onboarding", ProviderOnboardingView.as_view(), name="provider-onboarding"),
    path("provider/onboarding/", ProviderOnboardingView.as_view(), name="provider-onboarding-slash"),
    path("provider/profile/", ProviderProfileDetailView.as_view(), name="provider-profile"),
    path("provider/upload-document/", ProviderDocumentUploadView.as_view(), name="provider-upload-document"),
]
