from django.urls import path

from bookings.views import (
    BookingCreateView,
    CustomerBookingListView,
    ProviderBookingListView,
    BookingStatusUpdateView,
    BookingPaymentMethodUpdateView,
    BookingDetailView,
    BookingListView,
)

urlpatterns = [
    path("", BookingListView.as_view(), name="booking-list"),
    path("create/", BookingCreateView.as_view(), name="booking-create"),
    path("customer", CustomerBookingListView.as_view(), name="customer-bookings-no-slash"),
    path("customer/", CustomerBookingListView.as_view(), name="customer-bookings"),
    path("provider", ProviderBookingListView.as_view(), name="provider-bookings-no-slash"),
    path("provider/", ProviderBookingListView.as_view(), name="provider-bookings"),
    path("<int:pk>", BookingDetailView.as_view(), name="booking-detail-no-slash"),
    path("<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path("update-status/", BookingStatusUpdateView.as_view(), name="booking-update-status"),
    path("update-payment-method/", BookingPaymentMethodUpdateView.as_view(), name="booking-update-payment"),
]
