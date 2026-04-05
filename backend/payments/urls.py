from django.urls import path

from payments.views import PaymentCreateOrderView, PaymentHistoryView, PaymentVerifyView

urlpatterns = [
    path("create-order/", PaymentCreateOrderView.as_view(), name="payment-create-order"),
    path("verify/", PaymentVerifyView.as_view(), name="payment-verify"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),
]
