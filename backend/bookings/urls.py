from django.urls import path

from bookings.views import (
    BookingCreateView,
    BookingUpdateStatusView,
    CustomerBookingsView,
    ProviderBookingsView,
)

urlpatterns = [
    path("create", BookingCreateView.as_view(), name="booking-create"),
    path("customer", CustomerBookingsView.as_view(), name="booking-customer-list"),
    path("provider", ProviderBookingsView.as_view(), name="booking-provider-list"),
    path("update-status", BookingUpdateStatusView.as_view(), name="booking-update-status"),
]
