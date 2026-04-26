from django.urls import path

from bookings.views import (
    BookingCreateView,
    BookingListView,
    BookingUpdatePaymentMethodView,
    BookingUpdateStatusView,
    CustomerBookingsView,
    ProviderBookingsView,
)

urlpatterns = [
    path("", BookingListView.as_view(), name="booking-list"),
    path("create/", BookingCreateView.as_view(), name="booking-create"),
    path("customer", CustomerBookingsView.as_view(), name="booking-customer-list-no-slash"),
    path("customer/", CustomerBookingsView.as_view(), name="booking-customer-list"),
    path("provider", ProviderBookingsView.as_view(), name="booking-provider-list-no-slash"),
    path("provider/", ProviderBookingsView.as_view(), name="booking-provider-list"),
    path("update-status/", BookingUpdateStatusView.as_view(), name="booking-update-status"),
    path("update-payment-method/", BookingUpdatePaymentMethodView.as_view(), name="booking-update-payment-method"),
]
