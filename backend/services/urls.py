from django.urls import path

from services.views import (
    ProviderMyServiceDetailView,
    ProviderMyServiceListCreateView,
    ProviderMyServiceToggleActiveView,
    PublicCategoryListView,
    PublicServiceDetailView,
    PublicServiceListView,
)

urlpatterns = [
    path("categories/", PublicCategoryListView.as_view(), name="public-categories"),
    path("services/", PublicServiceListView.as_view(), name="public-services"),
    path("services/<int:pk>/", PublicServiceDetailView.as_view(), name="public-service-detail"),
    path("services/my/", ProviderMyServiceListCreateView.as_view(), name="provider-my-services"),
    path("services/my/<int:pk>/", ProviderMyServiceDetailView.as_view(), name="provider-my-service-detail"),
    path("services/my/<int:pk>/toggle/", ProviderMyServiceToggleActiveView.as_view(), name="provider-my-service-toggle"),
]
