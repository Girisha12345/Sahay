from django.urls import path

from services.views import (
    CategoryListView,
    ServiceDetailView,
    ServiceListCreateView,
)

urlpatterns = [
    path("categories", CategoryListView.as_view(), name="categories-list"),
    path("services", ServiceListCreateView.as_view(), name="services-list-create"),
    path("services/<int:pk>", ServiceDetailView.as_view(), name="service-detail"),
]
