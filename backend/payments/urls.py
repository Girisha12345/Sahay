from django.urls import path

from payments.views import PaymentHistoryView, PaymentIntentCreateView, PaymentWebhookView

urlpatterns = [
    path("create-intent", PaymentIntentCreateView.as_view(), name="payment-create-intent"),
    path("webhook", PaymentWebhookView.as_view(), name="payment-webhook"),
    path("history", PaymentHistoryView.as_view(), name="payment-history"),
]
