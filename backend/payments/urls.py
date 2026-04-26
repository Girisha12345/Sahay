from django.urls import path

from payments.views import (
    PaymentCreateOrderView,
    PaymentHistoryView,
    PaymentIntentCreateView,
    PaymentVerifyView,
    PaymentWebhookView,
    StripeIntentView,
    ProviderWalletView,
    RefundView,
)

urlpatterns = [
    path("", PaymentHistoryView.as_view(), name="payment-list"),
    path("create-intent/", PaymentIntentCreateView.as_view(), name="payment-create-intent"),
    path("create-order/", PaymentCreateOrderView.as_view(), name="payment-create-order"),
    path("stripe-intent/", StripeIntentView.as_view(), name="payment-stripe-intent"),
    path("verify/", PaymentVerifyView.as_view(), name="payment-verify"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),
    path("wallet/", ProviderWalletView.as_view(), name="provider-wallet"),
    path("refund/", RefundView.as_view(), name="payment-refund"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
]
