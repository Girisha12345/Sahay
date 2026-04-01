from django.urls import path

from support.views import SupportTicketCreateView, SupportTicketListView, SupportTicketUpdateView

urlpatterns = [
    path("tickets/create", SupportTicketCreateView.as_view(), name="support-ticket-create"),
    path("tickets", SupportTicketListView.as_view(), name="support-ticket-list"),
    path("tickets/<int:pk>", SupportTicketUpdateView.as_view(), name="support-ticket-update"),
]
